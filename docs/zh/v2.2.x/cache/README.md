---
title: 缓存模块
lang: zh
---

# 缓存模块

- [缓存模式](./cache_pattern.md)

beego 的 cache 模块是用来做数据缓存的，设计思路来自于 `database/sql`，目前支持 file、memcache、memory 和 redis 四种引擎，安装方式如下：

	go get github.com/beego/beego-cache

>>>如果你使用memcache 或者 redis 驱动就需要手工安装引入包

	go get -u github.com/beego/beego/v2/client/cache/memcache

>>>而且需要在使用的地方引入包

    import _ "github.com/beego/beego/v2/client/cache/memcache"

# 使用入门

首先引入包：

```go
import (
	"github.com/beego/beego/v2/client/cache"
)
```

# 缓存类型

目前支持四种不同的类型，接下来分别介绍这四种缓存如何创建：

- memory

  如下所示，参数的信息表示 GC 的时间，表示每隔 60s 会进行一次过期清理：

  	bm := cache.NewMemoryCache(60)

- file

  FileCache 的参数配置通过 option 模式，`FileCacheWithCachePath` 表示配置缓存的文件目录，`FileCacheWithFileSuffix` 表示配置文件后缀，`FileCacheWithDirectoryLevel` 表示配置目录层级，`FileCacheWithEmbedExpiry` 表示配置过期时间

  	bm, err := NewFileCache(
  						FileCacheWithCachePath("cache"),
  						FileCacheWithFileSuffix(".bin"),
  						FileCacheWithDirectoryLevel(2),
  						FileCacheWithEmbedExpiry(120))

- redis

  如下所示，redis 采用了库 [redigo](https://github.com/garyburd/redigo/tree/master/redis); 注意，这里需要用户自己提前创建 Redis Cache 的依赖 redis.Pool， 然后作为初始化 Redis Cache 的参数。

  ```go
  func main() {
  	dsn := "127.0.0.1:6379"
    password := "123456"
    dbNum := 0
    dialFunc := func() (c redis.Conn, err error) {
      c, err = redis.Dial("tcp", dsn)
      if err != nil {
        return nil, berror.Wrapf(err, cache.DialFailed,
          "could not dial to remote server: %s ", dsn)
      }
  
      if password != "" {
        if _, err = c.Do("AUTH", password); err != nil {
          _ = c.Close()
          return nil, err
        }
      }
  
      _, selecterr := c.Do("SELECT", dbNum)
      if selecterr != nil {
        _ = c.Close()
        return nil, selecterr
      }
      return
    }
    // initialize a new pool
    pool := &redis.Pool{
      Dial:        dialFunc,
      MaxIdle:     3,
      IdleTimeout: 3 * time.Second,
    }
  
    bm := NewRedisCache(pool)
  }
  ```

    * dsn 为连接的ip和端口
    * dbNum: 连接 Redis 时的 DB 编号. 默认是0.
    * password: 用于连接有密码的 Redis 服务器.


- memcache

  memcache 采用了 [vitess的库](https://github.com/youtube/vitess/tree/master/go/memcache)，dns 表示 memcache 的连接地址：

  	pool := memcache.New(dsn)
  	bm := NewMemCache(pool)

然后我们就可以使用bm增删改缓存：

```go
bm.Put(context.TODO(), "astaxie", 1, 10*time.Second)
bm.Get(context.TODO(), "astaxie")
bm.IsExist(context.TODO(), "astaxie")
bm.Delete(context.TODO(), "astaxie")
```

>>> 第一个参数是 Go 语言的context。我们引入context参数，是为了能够支持可观测性(tracing, metrics)

# 开发自己的引擎

cache 模块采用了接口的方式实现，因此用户可以很方便的实现接口，然后注册就可以实现自己的 Cache 引擎：

```go
type Cache interface {
	// Get a cached value by key.
	Get(ctx context.Context, key string) (interface{}, error)
	// GetMulti is a batch version of Get.
	GetMulti(ctx context.Context, keys []string) ([]interface{}, error)
	// Set a cached value with key and expire time.
	Put(ctx context.Context, key string, val interface{}, timeout time.Duration) error
	// Delete cached value by key.
	Delete(ctx context.Context, key string) error
	// Increment a cached int value by key, as a counter.
	Incr(ctx context.Context, key string) error
	// Decrement a cached int value by key, as a counter.
	Decr(ctx context.Context, key string) error
	// Check if a cached value exists or not.
	IsExist(ctx context.Context, key string) (bool, error)
	// Clear all cache.
	ClearAll(ctx context.Context) error
}
```
