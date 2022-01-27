---
title: Web 命名空间
lang: zh
---

# Namespace

`namespace`，也叫做命名空间，是 Beego 提供的一种逻辑上的组织 API 的手段。 大多数时候，我们注册路由的时候，会按照一定的规律组织，那么使用`namespace`就会使代码更加简洁可维护。

例如，我们整个应用分成两大块，一个是对安卓提供的 API，一个是对 IOS 提供的 API。那么整体上，就可以划分成两个命名空间；有一些应用会有版本概念，比如说早期是 V1，后面引入了 V2，再后来又引入了 V3，那么整个应用就有三个命名空间。不同版本的 API 注册在不同的命名空间之下。

`namespace`稍微有点复杂，所以你可能需要多写几个简单的`demo`来掌握它的用法。

## 例子

```go
func main() {
	uc := &UserController{}
	// 创建 namespace
	ns := web.NewNamespace("/v1",
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
	)
	//注册 namespace
	web.AddNamespace(ns)
	web.Run()
}

type MainController struct {
	web.Controller
}

func (mc *MainController) Home() {
	mc.Ctx.WriteString("this is home")
}

type UserController struct {
	web.Controller
}

func (uc *UserController) Get() {
	uc.Ctx.WriteString("get user")
}

func Health(ctx *context.Context) {
	ctx.WriteString("health")
}
```

在我们启动服务器之后，分别访问下面三个地址：

- `GET http://localhost:8080/v1/home`
- `GET http://localhost:8080/v1/user`
- `GET http://localhost:8080/v1/health`

都能得到对应输出。这些地址的规律可以总结为就是分段加起来。例如这个例子我们的`namespace`的前缀是`v1`，所以就是在注册的路由之前加上一段`v1`。

注意到，在`main`函数里面，我们采用了不同的方式来注册路由。可以说，不管是[函数式路由注册](router/functional_style/README.md) 还是 [控制器路由注册](router/ctrl_style/README.md)，对于`namespace`来说都是可以的。整体规律就是多了`NS`这个前缀。

例如说`web.Get`对应到`namespace`内部注册，就是`web.NSGet`。

同样的，我们也可以注册多个`namespace`，例如我们创建一个`v2`前缀的`namespace`。

## namespace 嵌套

有时候我们会希望`namespace`内部嵌套`namespace`。这个时候我们可以使用`web.NSNamespace`方法来注入一个子`namespace`。

例如：

```go
func main() {
	uc := &UserController{}
	// 初始化 namespace
	ns := web.NewNamespace("/v1",
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
		// 嵌套 namespace
		web.NSNamespace("/admin",
			web.NSRouter("/user", uc),
		),
	)
	//注册 namespace
	web.AddNamespace(ns)
	web.Run()
}
```

启动服务器，访问`GET http://localhost:8080/v1/admin/user`就能看到输出。我们依旧可以看到，路径是各层`namespace`拼接起来的。

## namespace 的条件执行

Beego 的`namespace`提供了一种条件判断机制。只有在符合条件的情况下，注册在该`namespace`下的路由才会被执行。本质上，这只是一个`filter`的应用。

例如，我们希望用户的请求的头部里面一定要带上一个`x-trace-id`才会被后续的请求处理：

```go
func main() {
	uc := &UserController{}
	// 初始化 namespace
	ns := web.NewNamespace("/v1",
		web.NSCond(func(b *context.Context) bool {
			return b.Request.Header["x-trace-id"][0] != ""
		}),
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
		// 嵌套 namespace
		web.NSNamespace("/admin",
			web.NSRouter("/user", uc),
		),
	)
	//注册 namespace
	web.AddNamespace(ns)
	web.Run()
}
```

一般来说，我们现在也不推荐使用这个特性，因为它的功能和`filter`存在重合，我们建议大家如果有需要，应该考虑自己正常实现一个`filter`，代码可理解性会更高。该特性会考虑在未来的版本用一个`filter`来替代，而后移除该方法。

## Filter

`namespace`同样支持`filter`。该`filter`只会作用于这个`namespace`之下注册的路由，而对别的路由没有影响。

我们有两种方式添加`Filter`，一个是在`NewNamespace`中，调用`web.NSBefore`或者`web.NSAfter`，也可以调用`ns.Filter()`

```go
func main() {
	uc := &UserController{}
	// 初始化 namespace
	ns := web.NewNamespace("/v1",
		web.NSCond(func(b *context.Context) bool {
			return b.Request.Header["x-trace-id"][0] != ""
		}),
		web.NSBefore(func(ctx *context.Context) {
			fmt.Println("before filter")
		}),
		web.NSAfter(func(ctx *context.Context) {
			fmt.Println("after filter")
		}),
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
		// 嵌套 namespace
		web.NSNamespace("/admin",
			web.NSRouter("/user", uc),
		),
	)

	ns.Filter("before", func(ctx *context.Context) {
		fmt.Println("this is filter for health")
	})
	//注册 namespace
	web.AddNamespace(ns)
	web.Run()
}
```

目前来说，`namespace`对`filter`的支持是有限的，只能支持`before`和`after`两种。

因此要支持复杂的`filter`，或者`filter-chain`，请参考[过滤器](filter/README.md)

## NSInclude

接下来我们讨论一个有点奇怪的东西，`web.NSInclude`方法。该方法是[注解路由](router/ctrl_style/README.md)的配套方法。

也就是意味着，它只对注解路由生效。

让我们来看一个简单的例子：

```go
func init() {
	api := web.NewNamespace("/api/v1",
		web.NSNamespace("/goods",
			web.NSInclude(
				&controllers.GoodsController{},
			),
		),
	)
	web.AddNamespace(api)
}
```

注意到，我们这里的`GoodsController`必然是一个注解路由的`Controller`，而且已经使用[`bee`命令](../bee/README.md)生成注解路由了。

如果不知道怎么定义注解路由`controller`，或者使用`bee`命令生成注解路由，请参考相关文档。

## 相关文档

[函数式路由注册](router/functional_style/README.md)
[控制器路由注册](router/ctrl_style/README.md)
[过滤器](./filter/README.md)
[注解路由](router/ctrl_style/README.md)
