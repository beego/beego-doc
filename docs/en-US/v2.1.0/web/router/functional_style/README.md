---
title: Functional Style
lang: en-US
---

# Functional Style

This style is closer to the syntax of Go itself, so we tend to recommend using this route registration method.

Example: 

```go
func main() {
	web.Get("/hello", func(ctx *context.Context) {
		ctx.WriteString("hello, world")
	})

	web.Run()
}
```

Note that inside the functional style of writing, we only need to provide a method that uses the `*context.Context` argument. This `context` is not GO's `context` package, but Beego's `context` package.

Or:

```go
func main() {

	web.Post("/post/hello", PostHello)

	web.Run()
}

func PostHello(ctx *context.Context) {
	ctx.WriteString("hello")
}
```

All APIs:

```
Get(rootpath string, f HandleFunc)
Post(rootpath string, f HandleFunc)
Delete(rootpath string, f HandleFunc)
Put(rootpath string, f HandleFunc)
Head(rootpath string, f HandleFunc)
Options(rootpath string, f HandleFunc)
Patch(rootpath string, f HandleFunc)
Any(rootpath string, f HandleFunc)
```
## Suggestions

One of the difficulties to face when using a functional registration approach is how to organize these methods.

In the controller style, all methods are naturally split by the controller. For example, in a simple system, we can have a `UserController`, and then all the methods related to `User` can be defined in this `Controller`; all the methods related to orders can be defined in the `OrderController`.

So from this point of view, `Controller` provides a natural way to organize these methods.

Well, in the functional style, we lack such a design.

An intuitive way is to organize them by files. For example, all user-related ones in their own project `api/user.go`.

If there are more methods, then one should further consider organizing by packages, which is also recommended. For example, creating a `user` directory under `api`, where all the methods for handling user-related requests are defined.

The last way, is to define a `Controller` by itself, but this `Controller` only has the effect of organizing the code, and is not the kind we emphasize inside the controller style.

For example, we can write a `Controller` without using `web.Controller`:

```go
type UserController struct {

}

func (ctrl UserController) AddUser(ctx *context.Context) {
    // you business code
}
```

**This `Controller` cannot be used for controller style reason registration**. It's just to provide a similar way to organize the code.

## Reference

[route rules](../router_rule.md)

[namespace](../namespace.md)
