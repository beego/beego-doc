---
title: 选择什么作为 Controller 方法的接收器
lang: zh
---

# 选择什么作为 Controller 方法的接收器

在我们的控制器风格路由里面，我们会声明一个`Controller`，并且所有的处理`HTTP`请求的方法都是定义在`Controller`上的。

例如最简单的例子：

```go
import "github.com/beego/beego/v2/server/web"

type UserController struct {
	web.Controller
}

func (u *UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}
```

注意，这里我们使用的接收器是**指针接收器**。那么我们能不能不用指针接收器呢？

答案是可以的。

```go
import "github.com/beego/beego/v2/server/web"

type UserController struct {
	web.Controller
}

func (u UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}
```

它和使用指针接收器的写法没什么区别，Beego 都能正确处理。

那么问题来了，我们该用哪个呢？
1） 优先使用指针，因为这符合 Beego 长期以来的实践；
2） 如果你使用了 `CtrlXXX` 一族来注册的话，可以考虑使用非指针。当然功能上没什么区别，只不过一个是`(*UserController).HelloWord`，一个是`UserController.HelloWord`，后面一个看起来要清爽；

对于 Beego 来说，用任何接收器都是可以的，**它们在功能上没什么区别**。剩下的就是是否优雅与个人癖好的问题了。
