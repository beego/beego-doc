---
title: What to choose as the receiver for the Controller methods
lang: en-US
---

# What to choose as the receiver for the Controller methods

Inside our controller-style routing, we declare a `Controller` and all the methods for handling `HTTP` requests are defined on the `Controller`.

Example: 

```go
import "github.com/beego/beego/v2/server/web"

type UserController struct {
	web.Controller
}

func (u *UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}
```

Note that the receiver we use here is the **Pointer receiver**. So can we not use a pointer receiver?

The answer is yes:

```go
import "github.com/beego/beego/v2/server/web"

type UserController struct {
	web.Controller
}

func (u UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}
```

It is no different from writing with a pointer receiver, and Beego handles both correctly.

So the question is, which one should we use? 
- Preferring the use of pointers, as this is in line with long-standing Beego practice 
- If you use the `CtrlXXX` family methods for registration, consider using a non-pointer. Of course there is no functional difference, except that one is `(*UserController).HelloWord` and the other is `UserController.HelloWord`, the latter one looks more refreshing；

For Beego, it is possible to use any receiver, **they do not differ in functionality**. The rest is a matter of elegance and personal preference.
