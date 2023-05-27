---
title: Cache Pattern
lang: en-US
---

We provide support for some cache pattern in cache module, to solve or alleviate the problems of cache hotspot invalid, penetration, and avalanche. 

These cache pattern are implemented using decorator design pattern.


## Read Through 

Read Through cache pattern essentially helps you load data from the database without caching it, and write the updated data back to the cache.
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
NewReadThroughCache takes two arguments：
- c Cache: the Cache instance
- expiration time.Duration: the expiration
- loadFunc func(ctx context.Context, key string) (any, error): Using this function to load data if the key is not present in Cache

In the previous example, when the key is not found, we directly return the concatenated string. In normal situations, data is loaded from the database in production environments.

**For this implementation, if the "Get" method is called on the "c" object and returns nil or err is not nil, it will attempt to load the data.**。

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

NewWriteThroughCache takes two argument：
- c Cache：the Cache instance
- fn func(ctx context.Context, key string, val any): store data function

WriteThroughCache will call the `fn` and then update the cache。

Note that "WriteThroughCache" does not solve the consistency problem completely, and you should use it with caution.

## Random Expire

This pattern is mainly used to solve the problem of cache avalanche, where a large number of keys expire at the same time. Therefore, it can be considered to add a random offset to the expiration time when setting the key-value. This can prevent the entire cache from expiring at the same time, thus avoiding the problem of cache avalanche.

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
NewRandomExpireCache by default adds a random offset to the expiration time in the range [3s, 8s]. This offset is suitable for cases where the data volume is small and the expiration time is in the few-minute range. If you need a more complex caching strategy, you can use the "WithRandomExpireOffsetFunc" option.

Of course, the "WithRandomExpireOffsetFunc" option has limitations. If it does not meet your needs, you can write a similar implementation yourself. For example, you can add a percentage offset to the expiration time of a key based on the expected expiration time of the key. For example, add a 1% random offset to the expiration time.

## Singleflight

In cases where the key does not exist or the cache is not found, multiple goroutines may be launched to load the data. Using this pattern can ensure that there is only one goroutine launched to load data for a key in the current process.

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

"NewSingleflightCache" and "NewReadThroughCache" have the same parameter meaning. These two cache patterns use the same parameters to configure the cache.

However, it is important to note that there is no impact between different keys, and there is also no impact between different Cache instances. For example, if there are fifty goroutines loading fifty different keys at this time, the final queries that land on the database will still be fifty.

## Bloom Filter

This mode is used to quickly determine whether the data corresponding to a key exists in a high-concurrency environment, and is particularly suitable for solving the problem of cache piercing.

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
In this example, we passed a Bloom filter that always returns true (indicating that the data exists). In normal cases, in your business, you should typically implement a Bloom filter based on memory or based on Redis to achieve high performance.










