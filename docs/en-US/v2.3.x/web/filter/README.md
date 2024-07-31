---
title: Web Filter
lang: en-US
---

# Web Filter

`filter` is the solution for AOP that we provide at Beego. It is applied not only in `web`, but also in the rest of the modules.

In Beego, `filter` has two responsibilities, one is as an implementation of `AOP` and the other is as a hook in the request lifecycle. So to understand `filter` you have to understand Beego's request handling process first.

## Quick Start

```go
import (
	"fmt"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context"
)

func main() {

	ctrl := &MainController{}
	web.InsertFilter("/user/*", web.BeforeExec, filterFunc)
	web.Run()
}

func filterFunc(ctx *context.Context) {
	fmt.Println("do something here")
}
```

Here we can see that the so-called `filter`, is a method whose parameter is `*context.Context`, and this is its definition:

```go
// FilterFunc defines a filter function which is invoked before the controller handler is executed.
// It's a alias of HandleFunc
// In fact, the HandleFunc is the last Filter. This is the truth
type FilterFunc = HandleFunc

// HandleFunc define how to process the request
type HandleFunc func(ctx *beecontext.Context)
```

> Note that we consider `filter` to be just a special kind of `handler`, so here `FilterFunc` is an alias for `HandleFunc`. From this perspective, we think that the last place to process a request is the last `filter`.

And InsertFilter:

```go
// InserFilter see HttpServer.InsertFilter
func InsertFilter(pattern string, pos int, filter FilterFunc, opts ...FilterOpt) *HttpServer {
	// ...
}
```

- `pattern`: string or regex to match against router rules. Use `/*` to match all.
- `pos`: the place to execute the Filter. There are five fixed parameters representing different execution processes.
    - web.BeforeStatic: Before finding the static file.
    - web.BeforeRouter: Before finding router.
    - web.BeforeExec: After finding router and before executing the matched Controller.
    - web.AfterExec: After executing Controller.
    - web.FinishRouter: After finishing router.
- `filter`: filter function type FilterFunc func(*context.Context)
- `opts`:
  - `web.WithReturnOnOutput`: sets the value of `returnOnOutput` (default `true`), if there is already output before this filter is performed, whether to not continue to execute this filter, the default setting is that if there is already output before (parameter `true`), then this filter will not be executed.
  - `web.WithResetParams`: Whether to reset the `filter` parameter, the default is `false`, because in case of conflict between the `pattern` of the `filter` and the `pattern` of the route itself, you can reset the `filter` parameter, so as to ensure that the correct parameter is obtained in the subsequent logic, for example, if the filter of `/api/*` is set, and the router of `/api/docs/*` is set at the same time, then when the router of `/api/docs/*` is executed, then the correct parameter is obtained in the subsequent logic. For example, if you set the filter of `/api/*` and also set the router of `/api/docs/*`, then when you access `/api/docs/swagger/abc.js`, set `:splat` parameter to `docs/swagger/abc.js` when executing `filter`, but if the option is `false`, it will keep `docs/swagger/abc.js` when executing the routing logic, and reset the `:splat` parameter if `true` is set.
  - `web.WithCaseSensitive`: case sensitive；

If it is not clear how to use these options, the best way is to write a few tests yourself to experiment with their effects.

Here is an example to authenticate if the user is logged in for all requests:

```go
var FilterUser = func(ctx *context.Context) {
    if strings.HasPrefix(ctx.Input.URL(), "/login") {
        return
    }
    
    _, ok := ctx.Input.Session("uid").(int)
    if !ok {
        ctx.Redirect(302, "/login")
    }
}

web.InsertFilter("/*", web.BeforeRouter, FilterUser)
```

Be aware that to access the `Session` method, the `pos` parameter cannot be set to `BeforeStatic`.

More details for `pattern` refer [router](./../router/router_rule.md)

## Update Existing Router

Custom router during runtime:

```go
var UrlManager = func(ctx *context.Context) {
    // 数据库读取全部的 url mapping 数据
	urlMapping := model.GetUrlMapping()
	for baseurl,rule:=range urlMapping {
		if baseurl == ctx.Request.RequestURI {
			ctx.Input.RunController = rule.controller
			ctx.Input.RunMethod = rule.method
			break
		}
	}
}

web.InsertFilter("/*", web.BeforeRouter, web.UrlManager)
```

## Filter And FilterChain

In v1.x, we can't invoke next `Filter` inside a `Filter`. So we got a problem: we could not do something "surrounding" request execution.

For example, if we want to do:
```
func filter() {
    // do something before serving request
    handleRequest()
    // do something after serving request
}
```

The typical cases are tracing and metrics.

So we enhance `Filter` by designing a new interface:

```go
type FilterChain func(next FilterFunc) FilterFunc
```

Here is a simple example:

```go
package main

import (
	"github.com/beego/beego/v2/core/logs"
	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context"
)

func main() {
	web.InsertFilterChain("/*", func(next web.FilterFunc) web.FilterFunc {
		return func(ctx *context.Context) {
			// do something
			logs.Info("hello")
			// don't forget this
			next(ctx)

			// do something
		}
	})
}
```

In this example, we only output "hello" and then we invoke next filter.

### Prometheus例子

```go
package main

import (
	"time"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/filter/prometheus"
)

func main() {
	// we start admin service
	// Prometheus will fetch metrics data from admin service's port
	web.BConfig.Listen.EnableAdmin = true

	web.BConfig.AppName = "my app"

	ctrl := &MainController{}
	web.Router("/hello", ctrl, "get:Hello")
	fb := &prometheus.FilterChainBuilder{}
	web.InsertFilterChain("/*", fb.FilterChain)
	web.Run(":8080")
	// after you start the server
	// and GET http://localhost:8080/hello
	// access http://localhost:8088/metrics
	// you can see something looks like:
	// http_request_web_sum{appname="my app",duration="1002",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1002
	// http_request_web_count{appname="my app",duration="1002",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1
	// http_request_web_sum{appname="my app",duration="1004",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1004
	// http_request_web_count{appname="my app",duration="1004",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1
}

type MainController struct {
	web.Controller
}

func (ctrl *MainController) Hello() {
	time.Sleep(time.Second)
	ctrl.Ctx.ResponseWriter.Write([]byte("Hello, world"))
}
```

If you don't use Beego's admin service, don't forget to expose `prometheus`'s port.

### Opentracing例子

```go
package main

import (
	"time"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/filter/opentracing"
)

func main() {
	// don't forget this to inject the opentracing API's implementation
	// opentracing2.SetGlobalTracer()

	web.BConfig.AppName = "my app"

	ctrl := &MainController{}
	web.Router("/hello", ctrl, "get:Hello")
	fb := &opentracing.FilterChainBuilder{}
	web.InsertFilterChain("/*", fb.FilterChain)
	web.Run(":8080")
	// after you start the server
}

type MainController struct {
	web.Controller
}

func (ctrl *MainController) Hello() {
	time.Sleep(time.Second)
	ctrl.Ctx.ResponseWriter.Write([]byte("Hello, world"))
}

```

Don't forget to using `SetGlobalTracer` to initialize opentracing.


## Builtin Filters

We provide a series of `filter`s that you can enable or disable, depending on the situation.

### Prometheus

```go
package main

import (
	"time"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/filter/prometheus"
)

func main() {
	// we start admin service
	// Prometheus will fetch metrics data from admin service's port
	web.BConfig.Listen.EnableAdmin = true

	web.BConfig.AppName = "my app"

	ctrl := &MainController{}
	web.Router("/hello", ctrl, "get:Hello")
	fb := &prometheus.FilterChainBuilder{}
	web.InsertFilterChain("/*", fb.FilterChain)
	web.Run(":8080")
	// after you start the server
	// and GET http://localhost:8080/hello
	// access http://localhost:8088/metrics
	// you can see something looks like:
	// http_request_web_sum{appname="my app",duration="1002",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1002
	// http_request_web_count{appname="my app",duration="1002",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1
	// http_request_web_sum{appname="my app",duration="1004",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1004
	// http_request_web_count{appname="my app",duration="1004",env="prod",method="GET",pattern="/hello",server="webServer:1.12.1",status="200"} 1
}

type MainController struct {
	web.Controller
}

func (ctrl *MainController) Hello() {
	time.Sleep(time.Second)
	ctrl.Ctx.ResponseWriter.Write([]byte("Hello, world"))
}
```

### Opentracing 

```go
package main

import (
	"time"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/filter/opentracing"
)

func main() {
	// don't forget this to inject the opentracing API's implementation
	// opentracing2.SetGlobalTracer()

	web.BConfig.AppName = "my app"

	ctrl := &MainController{}
	web.Router("/hello", ctrl, "get:Hello")
	fb := &opentracing.FilterChainBuilder{}
	web.InsertFilterChain("/*", fb.FilterChain)
	web.Run(":8080")
	// after you start the server
}

type MainController struct {
	web.Controller
}

func (ctrl *MainController) Hello() {
	time.Sleep(time.Second)
	ctrl.Ctx.ResponseWriter.Write([]byte("Hello, world"))
}

```

### Api Auth Filter

There are two points to understand when using the api auth filter:

- How to access this filter
- How to generate the correct signature

Basic usage：

```go

// import "github.com/beego/beego/v2/server/web/filter/apiauth"
web.InsertFilter("/", web.BeforeRouter, apiauth.APIBasicAuth("myid", "mykey"))
```

Where `mykey` is the key used to verify the signature, and is also the key needed when the upstream call is initiated. This access scheme is very simple, `beego` internal implementation will read `appid` from the request, and then if `appid` happens to be `myid`, `mykey` will be used to generate the signature and compare it with the signature also read from the parameters. If they are equal, the request will be processed, otherwise the request will be rejected and a `403` error will be returned.

Another usage is a custom method of finding keys based on `appid`:

```go
    // import "github.com/beego/beego/v2/server/web/filter/apiauth"
	web.InsertFilter("/", web.BeforeRouter, apiauth.APISecretAuth(func(appid string) string {
		// Here's how you define how to find the key based on the app id
		return appid + "key"
	}, 300))
```

Note that `300` represents the timeout parameter.

- The filter relies on reading `appid` from the request parameters and finding the key based on `appid`
- The filter relies on reading `timestamp`, the timestamp, from the request parameter, which is in the format `2006-01-02 15:04:05`
- The filter relies on reading the signature `signature` from the request parameters, and `beego` compares the read signature with its own signature generated from the key, i.e. forensics

In addition, as the caller, you can use the `apiauth.Signature` method directly to generate a signature to put inside the request to call the downstream.

Note that we do not recommend using this forensic filter on the public `API`. This is because the implementation has only basic functionality and does not have strong security - it is extremely key dependent. If its own key is exposed, then an attacker can easily generate the correct key based on the encryption method used by `beego`. The specific higher-security forensic implementation is out of the scope of `beego` and can be understood by developers who need it.

### Auth Filter

This filter is very similar to the previous api auth filter. But the two have different mechanisms. `apiauth` uses a signature mechanism and focuses on applications calling each other. This one should be called an authentication filter, which focuses on identification, and its internal mechanism is to use a username and password, similar to the login process.

This filter, reads the `token` from the request header `Authorization`. Currently, `beego` only supports the `Basic` encryption method, looks like:
```
Authorization Basic your-token
```

`beego` internally reads this `token` and decodes it to get the username and password it carries. `beego` compares the username and password to see if they match, a process that requires the developer to tell `beego` how to match the username and password when initializing the filter.

The basic usage:

```go
// import "github.com/beego/beego/v2/server/web/filter/auth"
web.InsertFilter("/", web.BeforeRouter, auth.Basic("your username", "your pwd"))
```

Or: 

```go
	// import "github.com/beego/beego/v2/server/web/filter/auth"
	web.InsertFilter("/", web.BeforeRouter, auth.NewBasicAuthenticator(func(username, pwd string) bool {
		// validation here
	}, "your-realm"))
	web.Run()
```

where `your-realm` is simply placed in the response header as an error message if the validation fails。

### Authz Filter

This filter is also authentication, not authentication. It focuses on whether **the user has access to a resource** compared to the previous two filters. Like the `Auth Filter`, it parses the username from  the `Authorization` header, except that this filter doesn't care about passwords.

Or rather, it should be called `Casbin` filter. For details, you can read [Casbin github](https://github.com/casbin/casbin). Note that `beego` is still using its `v1` version, while as of now they have been upgraded to `v2`.

After that, the filter combines the `http method` and the request path to determine if the user has permission. If there is permission, then `beego` will process the request.

Example: 

```go
// import "github.com/beego/beego/v2/server/web/filter/authz"
web.InsertFilter("/", web.BeforeRouter, authz.NewAuthorizer(casbin.NewEnforcer("path/to/basic_model.conf", "path/to/basic_policy.csv")))

```

More details refer to [Casbin github](https://github.com/casbin/casbin)

### CORS Filter


```go
	// import "github.com/beego/beego/v2/server/web/filter/cors"
	web.InsertFilter("/", web.BeforeRouter, cors.Allow(&cors.Options{
		AllowAllOrigins: true,
	}))
```

With this setting, requests coming under whatever domain are allowed. If you want to do fine-grained control, you can adjust the parameter value of `Options`。

### Rate Limit Filter

```go

// import "github.com/beego/beego/v2/server/web/filter/ratelimit"
web.InsertFilter("/", web.BeforeRouter, ratelimit.NewLimiter())

```

The token bucket algorithm is mainly influenced by two parameters, one is the capacity and the other is the rate. By default, the capacity is set to `100` and the rate is set to generate one token every ten milliseconds.

- `WithCapacity`
- `WithRate`
- `WithRejectionResponse`: the response if rejecting the request
- `WithSessionKey`: For example if the flow is restricted relative to a particular `API`, then the route for that `API` can be returned. In this case, then `web.BeforeRouter` should not be used, but `web.BeforeExec` should be used instead.

### Session Filter

This is experimental in nature, we try to support controlling `session` in different dimensions. So this `filter` is introduced.

```go
	// "github.com/beego/beego/v2/server/web"
	// "github.com/beego/beego/v2/server/web/filter/session"
	// websession "github.com/beego/beego/v2/server/web/session"
	web.InsertFilterChain("/need/session/path", session.Session(websession.ProviderMemory))
```

More details refer [session](../session/README.md)

## Reference

- [Router](./../router/router_rule.md)
