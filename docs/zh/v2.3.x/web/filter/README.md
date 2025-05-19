---
title: Web 过滤器
lang: zh
---

# Web 过滤器

`filter`是我们 Beego 提供的 AOP 的解决方案。不仅仅是在`web`中应用，也是在其余模块中应用。

在 Beego 中，`filter` 承担两方面的职责，一方面是作为`AOP`的实现，一方面是作为请求生命周期的钩子。所以要理解`filter`要先理解 Beego 的请求处理过程。

## 简单例子

我们来看一个最简单的例子：

```go
import (
	"fmt"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context"
)

func main() {

	ctrl := &MainController{}
	// 注册路由过滤器
	web.InsertFilter("/user/*", web.BeforeExec, filterFunc)
	web.Run()
}

// 定义 filter
func filterFunc(ctx *context.Context) {
	// 只是输出一个语句
	fmt.Println("过滤校验")
}
```

这里我们可以看到，所谓的`filter`，就是一个参数是`*context.Context`的方法，这个是它的定义：

```go
// FilterFunc defines a filter function which is invoked before the controller handler is executed.
// It's a alias of HandleFunc
// In fact, the HandleFunc is the last Filter. This is the truth
type FilterFunc = HandleFunc

// HandleFunc define how to process the request
type HandleFunc func(ctx *beecontext.Context)
```

> 注意观察这个定义，我们认为`filter`只是一种特殊的`handler`，所以在这里`FilterFunc`是`HandleFunc`的别名。从这个角度来说，我们认为最后处理请求的地方，就是最后的一个`filter`。

现在我们来看看`InsertFilter`的定义：

```go
// InserFilter see HttpServer.InsertFilter
func InsertFilter(pattern string, pos int, filter FilterFunc, opts ...FilterOpt) *HttpServer {
	// ...
}
```

各个参数的含义是：

1. `pattern`等价于注册路由时候的`pattern`，也可以理解为匹配规则；
2. `pos` 表示位置，准确来说，是指请求执行的各个阶段；
3. `filter` 则是逻辑代码；
4. `opts` 是 `filter` 的一些选项；

比较难理解的是 `pos`，它有很多个取值：

- `BeforeStatic` 静态地址之前
- `BeforeRouter` 寻找路由之前，从这里开始，我们就能够获得`session`了
- `BeforeExec` 找到路由之后，开始执行相应的 Controller 之前
- `AfterExec` 执行完 Controller 逻辑之后执行的过滤器
- `FinishRouter` 执行完逻辑之后执行的过滤器

而 `opts` 对应三个选项：

- `web.WithReturnOnOutput`: 设置 `returnOnOutput` 的值(默认`true`), 如果在进行到此过滤之前已经有输出，是否不再继续执行此过滤器,默认设置为如果前面已有输出(参数为`true`)，则不再执行此过滤器。
  
  (**特别注意:在使用 AfterExec、FinishRouter 这2个pos位置路由时,需要设置WithReturnOnOutput为false,不然不会生效,详见下面案例**)；
  
- `web.WithResetParams`: 是否重置`filter`的参数，默认是`false`，因为在`filter`的`pattern`和本身的路由的`pattern`冲突的时候，可以把`filter`的参数重置，这样可以保证在后续的逻辑中获取到正确的参数，例如设置了`/api/*` 的 filter，同时又设置了 `/api/docs/*` 的 router，那么在访问 `/api/docs/swagger/abc.js` 的时候，在执行`filter`的时候设置 `:splat` 参数为 `docs/swagger/abc.js`，但是如果该选项为 `false`，就会在执行路由逻辑的时候保持 `docs/swagger/abc.js`，如果设置了`true`，就会重置 `:splat` 参数；

- `web.WithCaseSensitive`: 是否大小写敏感；

如果不清楚如何使用这些选项，最好的方法是自己写几个测试来试验一下它们的效果。

比如，目前beego项目里面的InsertFilter方法的Example：

```go
// ExampleInsertFilter is an example of how to use InsertFilter
func ExampleInsertFilter() {

	app := NewHttpServerWithCfg(newBConfig())
	app.Cfg.CopyRequestBody = true
	path := "/api/hello"
	app.Get(path, func(ctx *context.Context) {
		s := "hello world"
		fmt.Println(s)
		_ = ctx.Resp(s)
	})

	app.InsertFilter("*", BeforeStatic, func(ctx *context.Context) {
		fmt.Println("BeforeStatic filter process")
	})

	app.InsertFilter("*", BeforeRouter, func(ctx *context.Context) {
		fmt.Println("BeforeRouter filter process")
	})

	app.InsertFilter("*", BeforeExec, func(ctx *context.Context) {
		fmt.Println("BeforeExec filter process")
	})

	// need to set the WithReturnOnOutput false
	app.InsertFilter("*", AfterExec, func(ctx *context.Context) {
		fmt.Println("AfterExec filter process")
	}, WithReturnOnOutput(false))

	// need to set the WithReturnOnOutput false
	app.InsertFilter("*", FinishRouter, func(ctx *context.Context) {
		fmt.Println("FinishRouter filter process")
	}, WithReturnOnOutput(false))

	reader := strings.NewReader("")
	req := httptest.NewRequest("GET", path, reader)
	req.Header.Set("Accept", "*/*")

	w := httptest.NewRecorder()
	app.Handlers.ServeHTTP(w, req)

	// Output:
	// BeforeStatic filter process
	// BeforeRouter filter process
	// BeforeExec filter process
	// hello world
	// AfterExec filter process
	// FinishRouter filter process
}
```

我们再看一个验证登录态的例子。该例子是假设启用了 Beego 的`session`模块：

```go
var FilterUser = func(ctx *context.Context) {
    _, ok := ctx.Input.Session("uid").(int)
    if !ok && ctx.Request.RequestURI != "/login" {
        ctx.Redirect(302, "/login")
    }
}

web.InsertFilter("/*", web.BeforeRouter, FilterUser)
```

要注意，要访问`Session`方法，`pos`参数不能设置为`BeforeStatic`。

`pattern` 的设置，可以参考[路由规则](./../router/router_rule.md)

## 过滤器修改原始路由

有些时候，我们可能想篡改已经某些已经注册的路由。例如原本我们的

如下示例实现了如何实现自己的路由规则:

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

## Filter 和 Filter Chain

前面提到的`filter`有一个固然的缺陷，就是它们是单向的。

例如，在考虑接入`Opentracing`和`prometheus`的时候，我们就遇到了这种问题。

考虑到这是一个通用的场景，我们在已有 Filter 的基础上，支持了`Filter-Chain`设计模式。

```go
type FilterChain func(next FilterFunc) FilterFunc
```

例如一个非常简单的例子：

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

这个例子里面，我们只是输出了一句"hello"，就调用了下一个 Filter。

在执行完`next(ctx)`之后，实际上，如果后面的 Filter 没有中断整个流程，那么这时候`OutPut`对象已经被赋值了，意味着能够拿到响应码等数据。

## 内置 Filter

我们提供了一系列的 `filter`，你可以看情况，决定是否启用。

### Prometheus 例子

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

别忘记了开启`prometheus`的端口。在你没有启动`admin`服务的时候，需要自己手动开启。

### Opentracing 例子

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

别忘了调用`opentracing`库的`SetGlobalTracer`方法，注入真正的`opentracing API`的实现。

### Api Auth Filter

鉴权过滤器用起来要理解两个点：

- 如何接入这个过滤器
- 如何生成正确的签名

接入鉴权过滤器有两种做法，最基本的做法是：

```go

// import "github.com/beego/beego/v2/server/web/filter/apiauth"
web.InsertFilter("/", web.BeforeRouter, apiauth.APIBasicAuth("myid", "mykey"))
```

其中`mykey`是用于校验签名的密钥，也是上游发起调用的时候需要用到的密钥。这种接入方案非常简单，`beego`内部实现会从请求参数里面读出`appid`，而后如果`appid`恰好是`myid`，则会用`mykey`来生成签名，和同样从参数里面读出来的签名进行比较。如果两者相等，则会处理请求，否则会拒绝请求，返回`403`错误。

另外一种用法是自定义根据`appid`来查找密钥的方法。接入方式是：

```go
    // import "github.com/beego/beego/v2/server/web/filter/apiauth"
	web.InsertFilter("/", web.BeforeRouter, apiauth.APISecretAuth(func(appid string) string {
		// 这里是你定义的如何根据 app id 来查找密钥的方法
		// 比如说这种简单的做法，生产勿用
		return appid + "key"
	}, 300))
```

注意，`300`代表的是超时时间。

使用这个过滤器，要注意以下几点：

- 过滤器依赖于从请求参数中读取`appid`，并且根据`appid`来查找密钥
- 过滤器依赖于从请求参数中读取`timestamp`，即时间戳，它的时间格式是`2006-01-02 15:04:05`
- 过滤器依赖于从请求参数中读取签名`signature`，并且`beego`会用读取到的签名和自己根据密钥生成的签名进行比较，也就是鉴权

此外，作为调用方，可以直接使用`apiauth.Signature`方法来生成签名，放到请求参数里面去请求下游接口。

注意，我们不建议在公共`API`上使用这个鉴权过滤器。因为该实现只具备基础的功能，并不具备很强的安全性——它极度依赖于密钥。如果自身的密钥暴露出去之后，那么攻击者可以轻易根据`beego`使用的加密方式，生成正确的密钥。具体的更高安全性的鉴权实现，已经脱离了`beego`的范畴，有需要的开发可以自行了解。

### Auth Filter

这个过滤器和前面的鉴权过滤器十分相像。但是两者的机制不同。`apiauth`使用的是签名机制，侧重于应用之间互相调用。而这个应该叫做认证过滤器，侧重的是身份识别，其内部机制是使用用户名和密码，类似于登录过程。

该过滤器，会从请求头部`Authorization`里面读取`token`。目前来说，`beego`只支持`Basic`这一种加密方式。即请求的头部应该包含：

```
Authorization Basic your-token
```

`beego`内部读取这个`token`并且进行解码，得到携带的用户名和密码。`beego`会比较用户名和密码是否匹配，这个过程需要开发者在初始化过滤器的时候告诉`beego`如何匹配用户名和密码。

初始化这个过滤器有两种方法，最基础的做法是：

```go
// import "github.com/beego/beego/v2/server/web/filter/auth"
web.InsertFilter("/", web.BeforeRouter, auth.Basic("your username", "your pwd"))
```

那么`beego`会用`Basic`方法传入的账号密码和从`token`里面解析出来的值做比较，账号和密码同时相等的时候，请求才会被处理。

也可以指定账号密码的匹配方式：

```go
	// import "github.com/beego/beego/v2/server/web/filter/auth"
	web.InsertFilter("/", web.BeforeRouter, auth.NewBasicAuthenticator(func(username, pwd string) bool {
		// 这里是你的校验逻辑。username, pwd 则是从请求头部解密出来的
	}, "your-realm"))
	web.Run()
```

其中`your-realm`只是在校验失败的时候作为一个错误信息放到响应头部。

### Authz Filter

这个过滤器同样是鉴权，而不是认证。它和前面两个过滤器比起来，它侧重的是**用户是否具有访问某个资源的权限**。它和`Auth Filter`一样，从`Authorization`的头部里面解析用户名，所不同的是，这个过滤器并不会理会密码。

或者说，它应该叫做`Casbin`过滤器。具体的可以阅读[Casbin github](https://github.com/casbin/casbin)。注意，`beego`依旧使用的是它的`v1`版本，而目前来看，它们已经升级到了`v2`版本。

之后，该过滤器会结合`http method`和请求路径，判断该用户是否权限。如果有权限，那么`beego`就会处理请求。

使用该过滤器的方式是：

```go
// import "github.com/beego/beego/v2/server/web/filter/authz"
web.InsertFilter("/", web.BeforeRouter, authz.NewAuthorizer(casbin.NewEnforcer("path/to/basic_model.conf", "path/to/basic_policy.csv")))

```

关于更多的`Casbin`的信息，请参考[Casbin github](https://github.com/casbin/casbin)

### CORS Filter

解决跨域问题的过滤器。使用该过滤器非常简单：

```go
	// import "github.com/beego/beego/v2/server/web/filter/cors"
	web.InsertFilter("/", web.BeforeRouter, cors.Allow(&cors.Options{
		AllowAllOrigins: true,
	}))
```

在这种设置之下，不管什么域名之下过来的请求，都是被允许的。如果想做精细化控制，可以调整`Options`的参数值。

### Rate Limit Filter

限流过滤器，使用的是令牌桶的实现。接入方式是：

```go

// import "github.com/beego/beego/v2/server/web/filter/ratelimit"
web.InsertFilter("/", web.BeforeRouter, ratelimit.NewLimiter())

```

令牌桶算法主要受到两个参数的影响，一个是容量，一个是速率。默认情况下，容量被设置为`100`，而速率被设置为每十毫秒产生一个令牌。

有很多选项可以控制这个过滤器的行为：

- `WithCapacity`：控制容量
- `WithRate`：速率控制
- `WithRejectionResponse`：拒绝请求的响应
- `WithSessionKey`：限流对象。例如如果相对某一个`API`限流，则可以返回该`API`的路由。在这种情况下，那么不能使用`web.BeforeRouter`，而应该使用`web.BeforeExec`

### Session Filter

这是一个试验性质，我们尝试支持在不同维度上控制`session`。所以引入了这个`filter`。

```go
	// "github.com/beego/beego/v2/server/web"
	// "github.com/beego/beego/v2/server/web/filter/session"
	// websession "github.com/beego/beego/v2/server/web/session"
	web.InsertFilterChain("/need/session/path", session.Session(websession.ProviderMemory))
```

核心就是通过参数来控制使用什么类型的`session`。

具体的细节可以参考[session](../session/README.md)

## 相关文档

- [路由规则](./../router/router_rule.md)
