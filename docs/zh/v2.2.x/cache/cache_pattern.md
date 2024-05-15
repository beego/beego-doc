---
title: 缓存模式
lang: zh
---

我们在 cache 里面提供了部分缓存模式的支持，用于解决、或者说缓解缓存穿透、击穿和雪崩的问题。

这些缓存模式都是使用装饰器设计模型实现的。

## Read Through 

Read Through 缓存模式本质上就是帮助你在缓存没有的情况下去数据库加载数据，并且回写缓存。
```go 
package main

import (
	"context"
	"fmt"
	"github.com/beego/beego/v2/client/cache"
	"log"
	"time"
)

func main() {
	var c cache.Cache = cache.NewMemoryCache()
	var err error
	c, err = cache.NewReadThroughCache(c,
		// expiration, same as the expiration of key
		time.Minute,
		// load func, how to load data if the key is absent.
		// in general, you should load data from database.
		func(ctx context.Context, key string) (any, error) {
			return fmt.Sprintf("hello, %s", key), nil
		})
	if err != nil {
		panic(err)
	}

	val, err := c.Get(context.Background(), "Beego")
	if err != nil {
		panic(err)
	}
	// print hello, Beego
	fmt.Print(val)
}
```
在 NewReadThroughCache 的初始化方法里面，接收：
- c Cache：被装饰的缓存实现
- expiration time.Duration：缓存过期时间
- loadFunc func(ctx context.Context, key string) (any, error)：如果缓存当中没有这个 key，那么就会调用这个方法去加载数据

在前面的例子里面，我们在 key 找不到的时候，直接返回了拼接的字符串。正常情况下，在生产环境下，是从数据库中加载数据的。

**对于这个实现来说，当调用 c 上面的 Get 方法得到 nil，或者 err 不为 nil，就会尝试加载数据**。

## Write Through 

```go
package main

import (
	"context"
	"fmt"
	"github.com/beego/beego/v2/client/cache"
	"time"
)

func main() {
	c := cache.NewMemoryCache()
	wtc, err := cache.NewWriteThroughCache(c, func(ctx context.Context, key string, val any) error {
		fmt.Printf("write data to somewhere key %s, val %v \n", key, val)
		return nil
	})
	if err != nil {
		panic(err)
	}
	err = wtc.Set(context.Background(),
		"/biz/user/id=1", "I am user 1", time.Minute)
	if err != nil {
		panic(err)
	}
	// it will print write data to somewhere key /biz/user/id=1, val I am user 1
}
```

NewWriteThroughCache 接收两个参数：
- c Cache：被装饰的缓存实现
- fn func(ctx context.Context, key string, val any)：存储数据

WriteThroughCache 会先调用 fn，而后再写缓存。

注意，WriteThroughCache 并不能解决一致性的问题，你自己使用的时候要小心。

## Random Expire

这个模式主要用于解决缓存雪崩问题，即大量的 key 在同一时间过期，那么就可以考虑在设置 key-value 的时候，给过期时间加上一个随机偏移量。

```go
package main

import (
	"context"
	"fmt"
	"github.com/beego/beego/v2/client/cache"
	"math/rand"
	"time"
)

func main() {
	mc := cache.NewMemoryCache()
	// use the default strategy which will generate random time offset (range: [3s,8s)) expired
	c := cache.NewRandomExpireCache(mc)
	// so the expiration will be [1m3s, 1m8s)
	err := c.Put(context.Background(), "hello", "world", time.Minute)
	if err != nil {
		panic(err)
	}

	c = cache.NewRandomExpireCache(mc,
		// based on the expiration
		cache.WithRandomExpireOffsetFunc(func() time.Duration {
			val := rand.Int31n(100)
			fmt.Printf("calculate offset %d", val)
			return time.Duration(val) * time.Second
		}))

	// so the expiration will be [1m0s, 1m100s)
	err = c.Put(context.Background(), "hello", "world", time.Minute)
	if err != nil {
		panic(err)
	}
}
```
NewRandomExpireCache 默认情况下会给过期时间加上一个 [3s, 8s) 的偏移量。这个偏移量在数据量不多，并且过期时间在几分钟级是合适的。如果你需要更加的复杂的策略，可以使用 WithRandomExpireOffsetFunc 选项。

当然，WithRandomExpireOffsetFunc 选项是有局限性的，如果不能满足你的需求，你可以自己写一个类似的实现，例如说根据 key 将要被设置的过期时间，加上一个百分比的偏移量，例如说 1% 内的随机偏移量。

## Singleflight

在 key 不存在，或者查询缓存失败的情况下，会有多个 goroutine 尝试去加载数据，那么使用该模式可以确保，一个 key 在当前进程里面只有一个 goroutine 去加载数据。

```go
package main

import (
	"context"
	"fmt"
	"github.com/beego/beego/v2/client/cache"
	"time"
)

func main() {
	c := cache.NewMemoryCache()
	c, err := cache.NewSingleflightCache(c, time.Minute, func(ctx context.Context, key string) (any, error) {
		return fmt.Sprintf("hello, %s", key), nil
	})
	if err != nil {
		panic(err)
	}
	val, err := c.Get(context.Background(), "Beego")
	if err != nil {
		panic(err)
	}
	// it will output hello, Beego
	fmt.Print(val)
}
```

NewSingleflightCache 与 NewReadThroughCache 参数是一样的含义。

但是要注意，不同的 key 之间没有影响，不同的 Cache 实例之间也没有影响。例如，如果此时有五十个 goroutine 加载五十个不同的 key，那么最终落在数据库上的查询还是会有五十个。

## Bloom Filter

该模式用于高并发环境下快速判断 key 对应的数据是否存在，比较适合解决缓存穿透问题。

```
package main

import (
	"context"
	"fmt"
	"github.com/beego/beego/v2/client/cache"
	"time"
)

func main() {
	c := cache.NewMemoryCache()
	c, err := cache.NewBloomFilterCache(c, func(ctx context.Context, key string) (any, error) {
		return fmt.Sprintf("hello, %s", key), nil
	}, &AlwaysExist{}, time.Minute)
	if err != nil {
		panic(err)
	}

	val, err := c.Get(context.Background(), "Beego")
	if err != nil {
		panic(err)
	}
	fmt.Println(val)
}

type AlwaysExist struct {
}

func (a *AlwaysExist) Test(data string) bool {
	return true
}

func (a *AlwaysExist) Add(data string) {

}
```
在这个例子里面，我们传入一个永远返回 true（表示数据存在）的布隆过滤器。正常情况下，在你的业务里面，应该是基于内存或者基于 Redis 来实现一个布隆过滤器。










