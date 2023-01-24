---
title: Controller Style Router
lang: en-US
---

# Controller Style Router

[Controller API](controller.md)

## Basic Usage

```go

import "github.com/beego/beego/v2/server/web"

type UserController struct {
    web.Controller
}
```

Adding methods:

```go
import "github.com/beego/beego/v2/server/web"

type UserController struct {
	web.Controller
}

func (u *UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}
func main() {
	web.AutoRouter(&UserController{})
	web.Run()
}
```

Accessing URL `http://127.0.0.1:8080/user/helloworld`：

![hello world.png](img/hello_world.png)

Note that the methods inside the controller that handle `http` requests must be public methods - i.e. **initially capitalized and have no parameters and no return value**. If your method does not meet this requirement, in most cases, a `panic` will occur, e.g. if your method has parameters:

```go
func (u *UserController) HelloWorldNoPtr(name string) {
	u.Ctx.WriteString("don't work")
}
```

> Note that the `HandleFunc` in functional style actually takes a `*Context` parameter

Or:

```go
func (u UserController) HelloWorldNoPtr() {
	u.Ctx.WriteString("don't work")
}
```

The general convention is to use a pointer receiver, but this is not mandatory. For a discussion of receivers, see[choose receiver](../../../qa/choose_func_recever_for_web.md)

### Controller Name

In some of the smarter APIs, we use the `Controller` name as a prefix, namespace, etc.

In general:

```go
type CtrlNameController struct {

}
```

For example, if we define a `UserController`, then the name of the `Controller` is `User`. If it is case-insensitive, then `user` is also a legal name.

Then let's say we define a `BuyerRefundController`, then `BuyerRefund` is the name, and when case insensitive, `buyerrefund` is also the legal name.

## AutoRouter

The routing rules resolved by `AutoRouter` are determined by the value of `RouterCaseSensitive`, the name of `Controller` and the method name.

Where `UserController` it's name is `User` and the method name is `HelloWorld`. Then.

- If `RouterCaseSensitive` is `true`, then `AutoRouter` registers two routes, `/user/helloworld/*`, `/User/HelloWorld/*`.
- If `RouterCaseSensitive` is `false`, then one route will be registered, `/user/helloworld/*`.

**In summary, it is always correct to use all lowercase paths when using `AutoRouter`**.

## AutoPrefix

`AutoRouter` is internally based on the implementation of `AutoPrefix`, so to speak, the name of the `Controller`, which is the registered prefix (prefix).

Example:

```go
import (
	"github.com/beego/beego/v2/server/web"
)

type UserController struct {
	web.Controller
}

func (u *UserController) HelloWorld() {
	u.Ctx.WriteString("Hello, world")
}

func main() {
	// get http://localhost:8080/api/user/helloworld
	// you will see return "Hello, world"
	ctrl := &UserController{}
	web.AutoPrefix("api", ctrl)
	web.Run()
}
```

Accessing`http://localhost:8080/api/user/helloworld` and then see "Hello, world"。

Similar to `AutoRoute`:

- If `RouterCaseSensitive` is `true`, then `AutoPrefix` registers two routes, `api/user/helloworld/*`, `api/User/HelloWorld/*`.

- If `RouterCaseSensitive` is `false`, then one route will be registered, `api/user/helloworld/*`.

Here we can summarize the rules of a general nature: **When we use `AutoPrefix`, the registered route matches the pattern `prefix/ctrlName/methodName`. **

## Manual 

If we don't want to use `AutoRoute` or `AutoPrefix` to register routes, because both of them depend on the name of the `Controller` and also on the name of the method. We may expect more flexibility.

In this scenario, we might consider say, using manual registration to register routes one by one.

In v2.0.2 we introduced a completely new way of registration:

```go
import (
	"github.com/beego/beego/v2/server/web"
)

type UserController struct {
	web.Controller
}

func (u *UserController) GetUserById() {
	u.Ctx.WriteString("GetUserById")
}

func (u *UserController) UpdateUser() {
	u.Ctx.WriteString("UpdateUser")
}

func (u *UserController) UserHome() {
	u.Ctx.WriteString("UserHome")
}

func (u *UserController) DeleteUser() {
	u.Ctx.WriteString("DeleteUser")
}

func (u *UserController) HeadUser() {
	u.Ctx.WriteString("HeadUser")
}

func (u *UserController) OptionUsers() {
	u.Ctx.WriteString("OptionUsers")
}

func (u *UserController) PatchUsers() {
	u.Ctx.WriteString("PatchUsers")
}

func (u *UserController) PutUsers() {
	u.Ctx.WriteString("PutUsers")
}

func main() {

	// get http://localhost:8080/api/user/123
	web.CtrlGet("api/user/:id", (*UserController).GetUserById)

	// post http://localhost:8080/api/user/update
	web.CtrlPost("api/user/update", (*UserController).UpdateUser)

	// http://localhost:8080/api/user/home
	web.CtrlAny("api/user/home", (*UserController).UserHome)

	// delete http://localhost:8080/api/user/delete
	web.CtrlDelete("api/user/delete", (*UserController).DeleteUser)

	// head http://localhost:8080/api/user/head
	web.CtrlHead("api/user/head", (*UserController).HeadUser)

	// patch http://localhost:8080/api/user/options
	web.CtrlOptions("api/user/options", (*UserController).OptionUsers)

	// patch http://localhost:8080/api/user/patch
	web.CtrlPatch("api/user/patch", (*UserController).PatchUsers)

	// put http://localhost:8080/api/user/put
	web.CtrlPut("api/user/put", (*UserController).PutUsers)

	web.Run()
}
```

It is important to note that our new registration method, requires that when we pass in the method, we pass in `(*YourController).MethodName`. This is because of a Go language feature that requires that if you wish to get the method when the receiver is a pointer, then you should use `(*YourController)`.

Without pointer:

```go
import (
	"github.com/beego/beego/v2/server/web"
)

type UserController struct {
	web.Controller
}

func (u UserController) GetUserById() {
	u.Ctx.WriteString("GetUserById")
}

func (u UserController) UpdateUser() {
	u.Ctx.WriteString("UpdateUser")
}

func (u UserController) UserHome() {
	u.Ctx.WriteString("UserHome")
}

func (u UserController) DeleteUser() {
	u.Ctx.WriteString("DeleteUser")
}

func (u UserController) HeadUser() {
	u.Ctx.WriteString("HeadUser")
}

func (u UserController) OptionUsers() {
	u.Ctx.WriteString("OptionUsers")
}

func (u UserController) PatchUsers() {
	u.Ctx.WriteString("PatchUsers")
}

func (u UserController) PutUsers() {
	u.Ctx.WriteString("PutUsers")
}

func main() {

	// get http://localhost:8080/api/user/123
	web.CtrlGet("api/user/:id", UserController.GetUserById)

	// post http://localhost:8080/api/user/update
	web.CtrlPost("api/user/update", UserController.UpdateUser)

	// http://localhost:8080/api/user/home
	web.CtrlAny("api/user/home", UserController.UserHome)

	// delete http://localhost:8080/api/user/delete
	web.CtrlDelete("api/user/delete", UserController.DeleteUser)

	// head http://localhost:8080/api/user/head
	web.CtrlHead("api/user/head", UserController.HeadUser)

	// patch http://localhost:8080/api/user/options
	web.CtrlOptions("api/user/options", UserController.OptionUsers)

	// patch http://localhost:8080/api/user/patch
	web.CtrlPatch("api/user/patch", UserController.PatchUsers)

	// put http://localhost:8080/api/user/put
	web.CtrlPut("api/user/put", UserController.PutUsers)

	web.Run()
}
```

We recommend that if you use this family of methods, then you should choose to use a structured receiver so that the code looks much cleaner.

The extra thing to notice is the `CtrlAny` method, which means that any `http` method can be handled.

### Historical Methods

Historically, we have registered routes in such a way:

```go
func main() {

	ctrl := &MainController{}

	// we register the path / to &MainController
	// if we don't pass methodName as third param
	// web will use the default mappingMethods
	// GET http://localhost:8080  -> Get()
	// POST http://localhost:8080 -> Post()
	// ...
	web.Router("/", ctrl)

	// GET http://localhost:8080/health => ctrl.Health()
	web.Router("/health", ctrl, "get:Health")

	// POST http://localhost:8080/update => ctrl.Update()
	web.Router("/update", ctrl, "post:Update")

	// support multiple http methods.
	// POST or GET http://localhost:8080/update => ctrl.GetOrPost()
	web.Router("/getOrPost", ctrl, "get,post:GetOrPost")

	// support any http method
	// POST, GET, PUT, DELETE... http://localhost:8080/update => ctrl.Any()
	web.Router("/any", ctrl, "*:Any")

	web.Run()
}
```

**We no longer recommend using this approach because readability and maintainability are not good. Especially when refactoring for method renaming, it is easy to make mistakes.**

## Reference

[check routes](../router_tree.md)

[choose receiver](../../../qa/choose_func_recever_for_web.md)
[Controller API](controller.md)
[route rules](../router_rule.md)
