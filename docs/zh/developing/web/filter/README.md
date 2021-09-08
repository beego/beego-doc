---
title: Web 过滤器
lang: zh
---

# Filter

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
- `web.WithReturnOnOutput`: 设置 `returnOnOutput` 的值(默认`true`), 如果在进行到此过滤之前已经有输出，是否不再继续执行此过滤器,默认设置为如果前面已有输出(参数为`true`)，则不再执行此过滤器；
- 
- `web.WithResetParams`: 是否重置`filter`的参数，默认是`false`，因为在`filter`的`pattern`和本身的路由的`pattern`冲突的时候，可以把`filter`的参数重置，这样可以保证在后续的逻辑中获取到正确的参数，例如设置了`/api/*` 的 filter，同时又设置了 `/api/docs/*` 的 router，那么在访问 `/api/docs/swagger/abc.js` 的时候，在执行`filter`的时候设置 `:splat` 参数为 `docs/swagger/abc.js`，但是如果该选项为 `false`，就会在执行路由逻辑的时候保持 `docs/swagger/abc.js`，如果设置了`true`，就会重置 `:splat` 参数；
- `web.WithCaseSensitive`: 是否大小写敏感；

如果不清楚如何使用这些选项，最好的方法是自己写几个测试来试验一下它们的效果。

我们在看一个验证登录态的例子。该例子是假设启用了Beego的`session`模块：

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

别忘记了开启`prometheus`的端口。在你没有启动`admin`服务的时候，需要自己手动开启。

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

别忘了调用`opentracing`库的`SetGlobalTracer`方法，注入真正的`opentracing API`的实现。

### 

## 相关文档
- [路由规则](./../router/router_rule.md)
