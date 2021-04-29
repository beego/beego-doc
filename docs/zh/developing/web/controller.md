---
title: Web Controller
lang: zh
---
# Controller

这一个章节，我们将指导你编写一个基本的`Controller`。

## 快速开始

写一个自定义的`Controller`，我们只需要**组合`web.Controller`**就可以了：

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
```

**需要注意的是，处理`http`请求的方法，必须满足两个条件**：
1. 接收器是指针；
2. 方法是公共方法，并且没有参数，没有返回值；

例如，如果你的方法接收器不是指针：
```go
func (u UserController) HelloWorldNoPtr() {
	u.Ctx.WriteString("don't work")
}
```
这种写法是错误的，运行的时候将会出现错误。

又或者你的方法有参数，那么也无法处理`http`请求，运行时候出现错误：

```go
func (u *UserController) HelloWorldNoPtr(name string) {
	u.Ctx.WriteString("don't work")
}
```

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

## 相关内容
[如何注册路由？](router/README.md)

