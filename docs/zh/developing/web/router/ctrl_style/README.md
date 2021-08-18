---
title: Web 注册控制器风格路由
lang: zh
---

# 注册控制器风格的路由

所谓的注册控制器风格路由，可以理解为典型的 MVC 风格代码。即我们会在`web`服务中声明各式各样的`Controller`。

在 Beego 里面注册这种风格的路由很简单，只需要声明一个`Controller`就可以：

```go

import "github.com/beego/beego/v2/server/web"

type UserController struct {
    web.Controller
}
```
这样我们就写好了一个`Controller`。

如果我们要想添加一个方法，那么可以：
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

当我们访问 URL `http://127.0.0.1:8080/user/helloworld`的时候，可以看到结果：

![hello world.png](img/hello_world.png)

需要注意的是，控制器里面处理`http`请求的方法必须是公共方法——即**首字母大写，并且没有参数，没有返回值**。如果你的方法不符合这个要求，大多数情况下，会发生`panic`，例如你的方法有参数：

```go
func (u *UserController) HelloWorldNoPtr(name string) {
	u.Ctx.WriteString("don't work")
}
```

> 注意比较，在函数式注册风格里面，我们的`HandleFunc`其实是接收一个`*Context`参数的

如果你的方法接收器不是指针：


golangci-lint run

```go
func (u UserController) HelloWorldNoPtr() {
	u.Ctx.WriteString("don't work")
}
```
这种写法也是可以的。一般的惯例是使用指针接收器，但是这并不强制。关于接收器的讨论，可以参考[选择什么作为方法接收器](../../../qa/choose_func_recever_for_web.md)

### Controller 的名字

在一些比较智能的API里面，我们会使用`Controller`的名字来作为前缀、命名空间等。

那么，`Controller`的名字是如何确定的呢？

在 Beego 里面，我们认为，一个`Controller`的定义是形如：
```go
type CtrlNameController struct {
	
}
```
比如说，我们定义了一个`UserController`，那么`Controller`的名字就是`User`。如果大小写不敏感，那么`user`也是合法的名字。

再比如说我们定义了一个`BuyerRefundController`，那么`BuyerRefund`就是名字，大小写不敏感的时候，`buyerrefund`也是合法的名字。

## AutoRouter

刚才我们使用的是`web`模块里面一个很实用的注册路由的方法`AutoRouter`。

`AutoRouter`解析出来的路由规则由`RouterCaseSensitive`的值，`Controller`的名字和方法名字共同决定。

其中`UserController`它的名字是`User`，而方法名字是`HelloWorld`。那么：

- 如果`RouterCaseSensitive`为`true`，那么`AutoRouter`会注册两个路由，`/user/helloworld/*`，`/User/HelloWorld/*`；
- 如果`RouterCaseSensitive`为`false`，那么会注册一个路由，`/user/helloworld/*`；

**总而言之，在使用`AutoRouter`的情况下，使用全小写的路径总是没错的**。

## AutoPrefix

`AutoRouter`内部是基于`AutoPrefix`实现的，可以说，`Controller`的名字，就是注册的前缀(prefix)。

下面我们来看一个简单的例子：

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

在运行之后，浏览器里面输入`http://localhost:8080/api/user/helloworld`，就能看到返回的响应"Hello, world"。

类似于我们前面提到的`AutoRoute`，这里注册的路由包含：

- 如果`RouterCaseSensitive`为`true`，那么`AutoPrefix`会注册两个路由，`api/user/helloworld/*`，`api/User/HelloWorld/*`；

- 如果`RouterCaseSensitive`为`false`，那么会注册一个路由，`api/user/helloworld/*`；

这里我们可以总结出来一般性质的规则： **当我们使用`AutoPrefix`的时候，注册的路由符合`prefix/ctrlName/methodName`这种模式。**

## 手动路由

如果我们并不想利用`AutoRoute`或者`AutoPrefix`来注册路由，因为这两个都依赖于`Controller`的名字，也依赖于方法的名字。某些时候我们可能期望在路由上，有更强的灵活性。

在这种场景下，我们可以考虑说，采用手工注册的方式，挨个注册路由。

在 v2.0.2 我们引入了全新的注册方式。下面我们来看一个完整的例子

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
需要注意的是，我们新的注册方法，要求我们传入方法的时候，传入的是`(*YourController).MethodName`。这是因为 Go 语言特性，要求在接收器是指针的时候，如果你希望拿到这个方法，那么应该用`(*YourController)`的形式。

那么，如果我们不用指针接收器：

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

我们建议如果使用这个系列的方法，那么应该选择使用结构体接收器，这样代码看上去要清爽很多。

要额外引起注意的是`CtrlAny`方法，这意味着，任意的`http`方法都可以被处理。

### 历史注册路由方式

和之前的注册路由方式比起来，我们这一次的改进，让用户可以在现代IDE中，点击方法名进行跳转。

历史上，我们的注册方式是这样的：
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

**我们不再推荐使用这种方式，因为可读性和可维护性都不太好。特别是重构进行方法重命名的时候，容易出错。**

## 相关内容
[如何查看我注册的路由信息](../router_tree.md)

[控制器方法该选择哪个接收器](../../../qa/choose_func_recever_for_web.md)

[路由规则——正确撰写路由](../router_rule.md)