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
需要注意的是，处理`http`请求的方法，必须满足两个条件：
1. 接收器是指针；
2. 方法是公共方法，并且没有参数，没有返回值；

## 相关内容
[如何注册路由？](router/README.md)

