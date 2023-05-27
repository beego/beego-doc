---
title: Namespace
lang: en-US
---

# Namespace

`namespace` is a logical means of organizing the API provided by Beego. Most of the time, when we register routes, we organize them according to certain rules, so using `namespace` will make the code more concise and maintainable.

For example, our whole application is divided into two blocks, one for the API provided by Android and one for the API provided by IOS. then overall, it can be divided into two namespaces; some applications will have the concept of version, for example, V1 in the early days, V2 was introduced later, and then V3 was introduced later, then the whole application will have three namespaces. Different versions of APIs are registered under different namespaces.

`namespace` is slightly more complicated, so you may need to write a few more simple `demos` to master its usage.

## Examples

```go
func main() {
	uc := &UserController{}
	// create namespace
	ns := web.NewNamespace("/v1",
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
	)
	// register namespace
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

You can accessing these URLs:

- `GET http://localhost:8080/v1/home`
- `GET http://localhost:8080/v1/user`
- `GET http://localhost:8080/v1/health`

The rule for these addresses can be summarized as concat. For example, in this example our `namespace` is prefixed with `v1`, so it is a `v1` segment before the registered route.

Notice that inside the `main` function, we use a different way to register routes. It can be said that either [functional route registration](./functional_style/README.md) or [controller route registration](./ctrl_style/README.md) is OK for `namespace`. 

## Nested Namespace

Sometimes we want `namespace` to be nested inside `namespace`. In this case we can use the `web.NSNamespace` method to inject a child `namespace`.

Example:

```go
func main() {
	uc := &UserController{}
	// initiate namespace
	ns := web.NewNamespace("/v1",
		web.NSCtrlGet("/home", (*MainController).Home),
		web.NSRouter("/user", uc),
		web.NSGet("/health", Health),
		// nested namespace
		web.NSNamespace("/admin",
			web.NSRouter("/user", uc),
		),
	)
	// register namespace
	web.AddNamespace(ns)
	web.Run()
}
```

Start the service, and access `GET http://localhost:8080/v1/admin/user`, you can see the output.

## Conditional Namespace Routes

Beego's `namespace` provides a conditional judgment mechanism. Routes registered under the `namespace` will be executed only if the conditions are met. Essentially, this is just a `filter` application.

For example, we want the user's request to have an `x-trace-id` in the header of the request in order to be processed by subsequent requests:

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

In general, we don't recommend using this feature now either, because its functionality overlaps with `filter`. We recommend that you should consider implementing a `filter` normally yourself if you need to, the code will be more understandable. This feature will be considered to be replaced by a `filter` in a future version, and the method will be removed later.

## Filter

`namespace` also supports `filter`. The `filter` will only work on routes registered under this `namespace`, and will have no effect on other routes.

We have two ways to add `Filter`, one is in `NewNamespace`, calling `web.NSBefore` or `web.NSAfter`, or we can call `ns.Filter()`

```go
func main() {
	uc := &UserController{}
	// initiate namespace
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
		// nested namespace
		web.NSNamespace("/admin",
			web.NSRouter("/user", uc),
		),
	)

	ns.Filter("before", func(ctx *context.Context) {
		fmt.Println("this is filter for health")
	})
	// register namespace
	web.AddNamespace(ns)
	web.Run()
}
```

Currently, `namespace` has limited support for `filter`, only `before` and `after`.

More details refer to [Filter](../filter/README.md)

## NSInclude

Next we discuss something a bit strange, the `web.NSInclude` method. This method is a companion method to [annotate/commente routes](./ctrl_style/README.md) companion method.

It only works for annotate/comment routes.

Example:

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

Notice that our `GoodsController` here is necessarily a `Controller` that annotates routes and has been generated using the [`bee` command](./bee/README.md) to generate the annotated routes.

## Reference

[functional style](./functional_style/README.md)
[controller style](./ctrl_style/README.md)
[filter](../filter/README.md)
[annotate/comment routes](./ctrl_style/README.md)
