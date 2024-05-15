---
title: Cache module
lang: zh
---

# Cache module

- [cache pattern](./cache_pattern.md)

The cache module of beego is used for data caching. The design idea comes from `database/sql`. It currently supports four engines: file, memcache, memory and redis. The installation method is as follows:：

	go get github.com/beego/beego-cache

>>>if you use memcached or redis driver, you need to manually install the import package

	go get -u github.com/beego/beego/v2/client/cache/memcache

>>>the package needs to be imported where it is used

    import _ "github.com/beego/beego/v2/client/cache/memcache"

# Started

first import the package：

```go
import (
	"github.com/beego/beego/v2/client/cache"
)
```

# Cache type

Four different types are currently supported, and the following describes how to create these four caches:

- memory

	As shown below, the parameter information indicates the GC time, which means that an expired cleanup will be performed every 60s：

		bm := cache.NewMemoryCache(60)
	
- file

  The parameters of FileCache are configured through the option pattern, `FileCacheWithCachePath` indicates the file directory of the configuration cache, `FileCacheWithFileSuffix` indicates the configuration file suffix, `FileCacheWithDirectoryLevel` indicates the configuration directory level, and `FileCacheWithEmbedExpiry` indicates the configuration expiration time:

  	bm, err := NewFileCache(
  						FileCacheWithCachePath("cache"),
  						FileCacheWithFileSuffix(".bin"),
  						FileCacheWithDirectoryLevel(2),
  						FileCacheWithEmbedExpiry(120))

- redis

  As shown below, redis uses the library [redigo](https://github.com/garyburd/redigo/tree/master/redis); Note that users need to create Redis Cache's dependency redis.Pool in advance, and then use it as initialization Parameters of Redis Cache。

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

  * dsn: for the connection ip and port
  * dbNum: the DB number when connecting to Redis. The default is 0
  * password: for connecting to a Redis server with a password


- memcache

	memcache uses [vitess library](https://github.com/youtube/vitess/tree/master/go/memcache), dns indicates the connection address of memcache：

		pool := memcache.New(dsn)
		bm := NewMemCache(pool)

then we can use bm to add, delete, and modify the cache：

```go
bm.Put(context.TODO(), "astaxie", 1, 10*time.Second)
bm.Get(context.TODO(), "astaxie")
bm.IsExist(context.TODO(), "astaxie")
bm.Delete(context.TODO(), "astaxie")
```

>>> The first parameter is the context of the Go language. We introduce the context parameter to support observability (tracing, metrics)

# Develop your own engine

The cache module is implemented in the form of an interface, so users can easily implement the interface, and then register to implement their own Cache engine：

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
