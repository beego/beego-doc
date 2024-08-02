---
title: Session
lang: zh
---

# Session

`beego` 内置了 `session` 模块，目前 `session` 模块支持的后端引擎包括 `memory`、`cookie`、`file`、`mysql`、`redis`、`couchbase`、`memcache`、`postgres`，用户也可以根据相应的接口实现自己的引擎。

## 在 Web 中使用 Session

在 `web`模块中使用 `session` 相当方便，只要在 `main` 入口函数中设置如下：

```go
web.BConfig.WebConfig.Session.SessionOn = true
```

或者通过配置文件配置如下：

```
sessionon = true
```

通过这种方式就可以开启 `session`，如何使用 `session`，请看下面的例子：

```go
func (this *MainController) Get() {
	v := this.GetSession("asta")
	if v == nil {
		this.SetSession("asta", int(1))
		this.Data["num"] = 0
	} else {
		this.SetSession("asta", v.(int)+1)
		this.Data["num"] = v.(int)
	}
	this.TplName = "index.tpl"
}
```

`session` 有几个方便的方法：

- `SetSession(name string, value interface{})`
- `GetSession(name string) interface{}`
- `DelSession(name string)`
- `SessionRegenerateID()`
- `DestroySession()`

`session` 操作主要有设置 `session`、获取 `session`，删除 `session`。

当然你可以通过下面的方式自己控制这些逻辑：

```go
sess := this.StartSession()
defer sess.SessionRelease()
```

`sess` 对象具有如下方法：

- `sess.Set()`
- `sess.Get()`
- `sess.Delete()`
- `sess.SessionID()`
- `sess.Flush()`

但是我还是建议大家采用 `SetSession、GetSession、DelSession` 三个方法来操作，避免自己在操作的过程中资源没释放的问题。

关于 `Session` 模块使用中的一些参数设置：

- `web.BConfig.WebConfig.Session.SessionOn`: 设置是否开启 `Session`，默认是 `false`，配置文件对应的参数名：`sessionon`。

- `web.BConfig.WebConfig.Session.SessionProvider`: 设置 `Session` 的引擎，默认是 `memory`，目前支持还有 `file`、`mysql`、`redis` 等，配置文件对应的参数名：`sessionprovider`。

- `web.BConfig.WebConfig.Session.SessionName`: 设置 `cookies` 的名字，`Session` 默认是保存在用户的浏览器 `cookies` 里面的，默认名是 `beegosessionID`，配置文件对应的参数名是：`sessionname`。

- `web.BConfig.WebConfig.Session.SessionGCMaxLifetime`: 设置 `Session` 过期的时间，默认值是 `3600` 秒，配置文件对应的参数：`sessiongcmaxlifetime`。

- `web.BConfig.WebConfig.Session.SessionProviderConfig`: 设置对应 `file`、`mysql`、`redis` 引擎的保存路径或者链接地址，默认值是空，配置文件对应的参数：`sessionproviderconfig`。

- `web.BConfig.WebConfig.Session.SessionHashFunc`: 默认值为 `sha1`，采用 `sha1` 加密算法生产 `sessionid`

- `web.BConfig.WebConfig.Session.SessionCookieLifeTime`: 设置 `cookie` 的过期时间，`cookie` 是用来存储保存在客户端的数据。

在使用某种特定引擎的时候，需要匿名引入该引擎对应的包，以完成初始化工作:

```go
import _ "github.com/beego/beego/v2/server/web/session/mysql"
```

### 不同引擎的初始化工作

#### File

当 `SessionProvider` 为 `file` `SessionProviderConfig` 是指保存文件的目录，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider="file"
web.BConfig.WebConfig.Session.SessionProviderConfig = "./tmp"
```

#### MySQL

当 `SessionProvider` 为 `mysql` 时，`SessionProviderConfig` 是链接地址，采用 [go-sql-driver](https://github.com/go-sql-driver/mysql)，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider = "mysql"
web.BConfig.WebConfig.Session.SessionProviderConfig = "username:password@protocol(address)/dbname?param=value"
```

需要特别注意的是，在使用 `mysql` 存储 `session` 信息的时候，需要事先在 `mysql` 创建表，建表语句如下

```sql
CREATE TABLE `session` (
	`session_key` char(64) NOT NULL,
	`session_data` blob,
	`session_expiry` int(11) unsigned NOT NULL,
	PRIMARY KEY (`session_key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
```

#### Redis

当 `SessionProvider` 为 `redis` `时，SessionProviderConfig` 是 `redis` 的链接地址，采用了 [redigo](https://github.com/garyburd/redigo)，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider = "redis"
web.BConfig.WebConfig.Session.SessionProviderConfig = "127.0.0.1:6379"
```

#### memcache

当 `SessionProvider` 为 `memcache` `时，SessionProviderConfig` 是 `memcache` 的链接地址，采用了 [memcache](https://github.com/beego/memcache)，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider = "memcache"
web.BConfig.WebConfig.Session.SessionProviderConfig = "127.0.0.1:7080"
```

#### Postgres

当 `SessionProvider` 为 `postgres` `时，SessionProviderConfig` 是 `postgres` 的链接地址，采用了 [postgres](https://github.com/lib/pq)，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider = "postgresql"
web.BConfig.WebConfig.Session.SessionProviderConfig = "postgres://pqgotest:password@localhost/pqgotest?sslmode=verify-full"
```

#### Couchbase

当 `SessionProvider` 为 `couchbase` `时，SessionProviderConfig` 是 `couchbase` 的链接地址，采用了 [couchbase](https://github.com/couchbaselabs/go-couchbase)，如下所示：

```go
web.BConfig.WebConfig.Session.SessionProvider = "couchbase"
web.BConfig.WebConfig.Session.SessionProviderConfig = "http://bucketname:bucketpass@myserver:8091"
```

### 特别注意点

因为 `session` 内部采用了 `gob` 来注册存储的对象，例如 `struct`，所以如果你采用了非 `memory` 的引擎，请自己在 `main.go` 的 `init` 里面注册需要保存的这些结构体，不然会引起应用重启之后出现无法解析的错误

## 单独使用 Session 模块

如果不想使用 `beego` 的 `web` 模块，但是想使用 `beego` 的 `session`模块，也是可以的

首先你必须导入包：

```go
import (
	"github.com/beego/beego/v2/server/web/session"
)
```

然后你初始化一个全局的变量用来存储 `session` 控制器：

```go
var globalSessions *session.Manager
```

接着在你的入口函数中初始化数据：

```go
func init() {
	sessionConfig := &session.ManagerConfig{
        CookieName:"gosessionid",
        EnableSetCookie: true,
        Gclifetime:3600,
        Maxlifetime: 3600,
        Secure: false,
        CookieLifeTime: 3600,
        ProviderConfig: "./tmp",
	}
	globalSessions, _ = session.NewManager("memory",sessionConfig)
	go globalSessions.GC()
}
```

`NewManager`函数的参数的函数如下所示

1. 引擎名字，可以是`memory`、`file`、`MySQL`或`Redis`。
2. 一个`JSON`字符串,传入`Manager`的配置信息
   - `cookieName`: 客户端存储`cookie`的名字。
   - `enableSetCookie`, `omitempty`: 是否开启 `SetCookie`, `omitempty`这个设置
   - `gclifetime`: 触发 `GC` 的时间。
   - `maxLifetime`: 服务器端存储的数据的过期时间
   - `secure`: 是否开启`HTTPS`，在`cookie`中设置`cookie.Secure`。
   - `sessionIDHashFunc`: `sessionID`生产的函数，默认是`sha1`算法。
   - `sessionIDHashKey`: `hash`算法中的`key`。
   - `cookieLifeTime`: 客户端存储的 `cookie` 的时间，默认值是 `0`，即浏览器生命周期。
   - `providerConfig`: 配置信息，根据不同的引擎设置不同的配置信息，详细的配置请看下面的引擎设置

最后我们的业务逻辑处理函数中可以这样调用：

```go
func login(w http.ResponseWriter, r *http.Request) {
	sess, _ := globalSessions.SessionStart(w, r)
	defer sess.SessionRelease(w)
	username := sess.Get("username")
	if r.Method == "GET" {
		t, _ := template.ParseFiles("login.gtpl")
		t.Execute(w, nil)
	} else {
		sess.Set("username", r.Form["username"])
	}
}
```

`globalSessions` 有多个函数如下所示：

- `SessionStart` 根据当前请求返回 `session` 对象
- `SessionDestroy` 销毁当前 `session` 对象
- `SessionRegenerateId` 重新生成 `sessionID`
- `GetActiveSession` 获取当前活跃的 `session` 用户
- `SetHashFunc` 设置 `sessionID` 生成的函数
- `SetSecure` 设置是否开启 `cookie` 的 `Secure` 设置

返回的 `session` 对象是一个 `Interface`，包含下面的方法

- `Set(ctx context.Context, key, value interface{}) error`
- `Get(ctx context.Context, key interface{}) interface{}`
- `Delete(ctx context.Context, key interface{}) error`
- `SessionID() string`
- `SessionRelease(ctx context.Context, w http.ResponseWriter)`
- `SessionReleaseIfPresent(ctx context.Context, w http.ResponseWriter)`
- `Flush(ctx context.Context) error`

需要特别注意的是，`SessionRelease` 和 `SessionReleaseIfPresent` 是用来释放会话资源的，`SessionReleaseIfPresent` 是在 `session` 存在的时候，释放会话资源，并不是所有的引擎都支持这个特性，你需要检查具体的实现是否支持这个特性。`SessionRelease` 是在除`mysql`, `postgres`, `mem` 以外的引擎中，无论 `session` 是否存在都会释放会话资源，`mysql`, `postgres` 引擎会在 `session` 存在的时候，释放会话资源，`mem` 引擎会在 `session`
在 `Set`，`Delete` 和 `Flush` 的时候，自动释放会话资源。

### 引擎设置

上面已经展示了 `memory` 的设置，接下来我们看一下其他三种引擎的设置方式：

- `mysql`: 其他参数一样，只是第四个参数配置设置如下所示，详细的配置请参考 [mysql](https://github.com/go-sql-driver/mysql#dsn-data-source-name)：

  ```
  username:password@protocol(address)/dbname?param=value
  ```

- `Redis`: 配置文件信息如下所示，表示链接的地址，连接池，访问密码，没有保持为空：

  > 注意：若使用 Redis 等引擎作为 session backend，请在使用前导入 < \_ "github.com/beego/beego/v2/server/web/session/redis" >

          否则会在运行时发生错误，使用其他引擎时也是同理。

  ```go
    127.0.0.1:6379,100,astaxie
  ```

- `file`: 配置文件如下所示，表示需要保存的目录，默认是两级目录新建文件，例如 `sessionID` 是 `xsnkjklkjjkh27hjh78908`，那么目录文件应该是 `./tmp/x/s/xsnkjklkjjkh27hjh78908`：
  ```go
  ./tmp
  ```

## 如何创建自己的引擎

在开发应用中，你可能需要实现自己的 `session` 引擎，例如 `memcache` 的引擎。

```go
// Store contains all data for one session process with specific id.
type Store interface {
    Set(ctx context.Context, key, value interface{}) error              // Set set session value
    Get(ctx context.Context, key interface{}) interface{}               // Get get session value
    Delete(ctx context.Context, key interface{}) error                  // Delete delete session value
    SessionID(ctx context.Context) string                               // SessionID return current sessionID
    SessionReleaseIfPresent(ctx context.Context, w http.ResponseWriter) // SessionReleaseIfPresent release the resource & save data to provider & return the data when the session is present, not all implementation support this feature, you need to check if the specific implementation if support this feature.
    SessionRelease(ctx context.Context, w http.ResponseWriter)          // SessionRelease release the resource & save data to provider & return the data
    Flush(ctx context.Context) error                                    // Flush delete all data
}

// Provider contains global session methods and saved SessionStores.
// it can operate a SessionStore by its id.
type Provider interface {
	SessionInit(ctx context.Context, gclifetime int64, config string) error
	SessionRead(ctx context.Context, sid string) (Store, error)
	SessionExist(ctx context.Context, sid string) (bool, error)
	SessionRegenerate(ctx context.Context, oldsid, sid string) (Store, error)
	SessionDestroy(ctx context.Context, sid string) error
	SessionAll(ctx context.Context) int // get all active session
	SessionGC(ctx context.Context)
}
```

最后需要注册自己写的引擎：

```go
func init() {
	Register("own", ownadaper)
}
```
