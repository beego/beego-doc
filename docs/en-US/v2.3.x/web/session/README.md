---
title: Session
lang: en-US
---

# Session

`beego` has a built-in `session` module. Currently, the backend engines supported by the `session` module include `memory`, `cookie`, `file`, `mysql`, `redis`, `couchbase`, `memcache`, `postgres`, and users can also implement their own engines according to the corresponding interfaces.

## Web Session 

Example

```go
web.BConfig.WebConfig.Session.SessionOn = true
```

Or in configuration file:

```
sessionon = true
```

And then you can use session:

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

`session` contains APIs:

- `SetSession(name string, value interface{})`
- `GetSession(name string) interface{}`
- `DelSession(name string)`
- `SessionRegenerateID()`
- `DestroySession()`

Or you can get the entire session instance:

```go
sess := this.StartSession()
defer sess.SessionRelease()
```

`sess` contains APIs:

- `sess.Set()`
- `sess.Get()`
- `sess.Delete()`
- `sess.SessionID()`
- `sess.Flush()`

But we still recommend you to use `SetSession, GetSession, DelSession` three methods to operate, to avoid the problem of not releasing resources in the process of their own operations.

Some parameters:

- `web.BConfig.WebConfig.Session.SessionOn`: Set whether to open `Session`, the default is `false`, the corresponding parameter name of the configuration file: `sessionon`

- `web.BConfig.WebConfig.Session.SessionProvider`: Set the engine of `Session`, the default is `memory`, currently there are `file`, `mysql`, `redis`, etc., the configuration file corresponds to the parameter name: `sessionprovider`.

- `web.BConfig.WebConfig.Session.SessionName`: Set the name of `cookies`, `Session` is saved in the user's browser `cookies` by default, the default name is `beegosessionID`, the corresponding parameter name of the configuration file is: `sessionname`.

- `web.BConfig.WebConfig.Session.SessionGCMaxLifetime`: Set the `Session` expiration time, the default value is `3600` seconds, the corresponding parameter of the configuration file: `sessiongcmaxlifetime`.

- `web.BConfig.WebConfig.Session.SessionProviderConfig`: Set the save path or address of the corresponding `file`, `mysql`, `redis` engines, the default value is empty, and the corresponding parameter of the configuration file: `sessionproviderconfig`.

- `web.BConfig.WebConfig.Session.SessionHashFunc`: Default value is `sha1`, using `sha1` encryption algorithm to produce `sessionid`

- `web.BConfig.WebConfig.Session.SessionCookieLifeTime`: Set the expiration time for `cookie`, which is used to store data stored on the client.

When using a particular engine, you need to anonymously introduce the package corresponding to that engine to complete the initialization work:

```go
import _ "github.com/beego/beego/v2/server/web/session/mysql"
```

### Engines

#### File

When `SessionProvider` is `file` `SessionProviderConfig` is the directory where the file is saved, as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "file"
web.BConfig.WebConfig.Session.SessionProviderConfig = "./tmp"
```

#### MySQL

When `SessionProvider` is `mysql`, `SessionProviderConfig` is the address, using [go-sql-driver](https://github.com/go-sql-driver/mysql), as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "mysql"
web.BConfig.WebConfig.Session.SessionProviderConfig = "username:password@protocol(address)/dbname?param=value"
```

It should be noted that when using `mysql` to store `session` information, you need to create a table in `mysql` beforehand, and the table creation statement is as follows:

```sql
CREATE TABLE `session` (
	`session_key` char(64) NOT NULL,
	`session_data` blob,
	`session_expiry` int(11) unsigned NOT NULL,
	PRIMARY KEY (`session_key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
```

#### Redis

When `SessionProvider` is `redis` `, SessionProviderConfig` is the address of `redis`, using [redigo](https://github.com/garyburd/redigo), as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "redis"
web.BConfig.WebConfig.Session.SessionProviderConfig = "127.0.0.1:6379"
```

#### memcache

When `SessionProvider` is `memcache``, SessionProviderConfig` is the address of `memcache`, using [memcache](https://github.com/beego/memcache), as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "memcache"
web.BConfig.WebConfig.Session.SessionProviderConfig = "127.0.0.1:7080"
```

#### Postgress

When `SessionProvider` is `postgres` `, SessionProviderConfig` is the address of `postgres`, using [postgres](https://github.com/lib/pq), as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "postgresql"
web.BConfig.WebConfig.Session.SessionProviderConfig = "postgres://pqgotest:password@localhost/pqgotest?sslmode=verify-full"
```

#### Couchbase

When `SessionProvider` is `couchbase` `, SessionProviderConfig` is the **address** of `couchbase`, using [couchbase](https://github.com/couchbaselabs/go- couchbase), as follows:

```go
web.BConfig.WebConfig.Session.SessionProvider = "couchbase"
web.BConfig.WebConfig.Session.SessionProviderConfig = "http://bucketname:bucketpass@myserver:8091"
```

### Notices

Because `session` uses `gob` to register stored objects, such as `struct`, if you use a non-`memory` engine, please register these structures in `init` of `main.go` yourself, otherwise it will cause an unresolvable error after application restart

## Using Session Without Web Module

Import the module:

```go
import (
	"github.com/beego/beego/v2/server/web/session"
)
```

Initiate the manager instance：

```go
var globalSessions *session.Manager
```

Next, initialize the data in your entry function:

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

Parameters of NewManager:

1. Saving provider name: memory, file, mysql, redis
2. A JSON string that contains the config information.
    1. cookieName: Cookie name of session id saved on the client
    2. enableSetCookie, omitempty: Whether to enable SetCookie, omitempty
    3. gclifetime: The interval of GC.
    4. maxLifetime: Expiration time of data saved on the server
    5. secure: Enable https or not. There is `cookie.Secure` while configure cookie.
    6. sessionIDHashFunc: SessionID generator function. `sha1` by default.
    7. sessionIDHashKey: Hash key.
    8. cookieLifeTime: Cookie expiration time on the client. 0 by default, which means life time of browser.
    9. providerConfig: Provider-specific config. See below for more information.

Then we can use session in our code:

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

Here are the methods of globalSessions:

- `SessionStart` Return session object based on current request.
- `SessionDestroy` Destroy current session object.
- `SessionRegenerateId` Regenerate a new sessionID.
- `GetActiveSession` Get active session user.
- `SetHashFunc` Set sessionID generator function.
- `SetSecure` Enable Secure cookie or not.

The returned session object is an Interface. Here are the methods:

- `Set(ctx context.Context, key, value interface{}) error`
- `Get(ctx context.Context, key interface{}) interface{}`
- `Delete(ctx context.Context, key interface{}) error`
- `SessionID() string`
- `SessionRelease(ctx context.Context, w http.ResponseWriter)`
- `SessionReleaseIfPresent(ctx context.Context, w http.ResponseWriter)`
- `Flush(ctx context.Context) error`

## Engines setting

We've already seen configuration of `memory` provider. Here is the configuration of the others:

- `mysql`:

  All the parameters are the same as memory's except the fourth parameter, e.g.:

  	username:password@protocol(address)/dbname?param=value

  For details see the [go-sql-driver/mysql](https://github.com/go-sql-driver/mysql#dsn-data-source-name) documentation.

- `redis`:

  Connection config: address,pool,password

  	127.0.0.1:6379,100,astaxie

- `file`:

  The session save path. Create new files in two levels by default.  E.g.: if sessionID is `xsnkjklkjjkh27hjh78908` the file will be saved as `./tmp/x/s/xsnkjklkjjkh27hjh78908`

  	./tmp

## Creating a new provider

Sometimes you need to create your own session provider. The Session module uses interfaces, so you can implement this interface to create your own provider easily.

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

Finally, register your provider:

	func init() {
		// ownadapter is an instance of session.Provider
		session.Register("own", ownadapter)
	}
