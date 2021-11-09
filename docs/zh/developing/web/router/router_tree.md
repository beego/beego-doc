---
title: 查看已注册路由
lang: zh
---
# 查看已注册路由

在排查问题的时候，我们可能想知道，整个系统究竟注册了哪些路由。Web 提供了一个非常有用的方法`web.PrintTree()`，该方法会把所有注册的路由信息返回，而后我们就可以依次遍历打印：
```go
package main

import (
	"fmt"
	"github.com/beego/beego/v2/server/web"
)

type UserController struct {
	web.Controller
}

func (u *UserController) HelloWorld()  {
	u.Ctx.WriteString("hello, world")
}

func main() {
	web.BConfig.RouterCaseSensitive = false
	web.AutoRouter(&UserController{})
	tree := web.PrintTree()
	methods := tree["Data"].(web.M)
	for k, v := range methods {
		fmt.Printf("%s => %v\n", k, v)
	}
}
```

如果要是注册的路由，使用了`*`作为方法，也就是匹配任何 HTTP 方法，那么就会每个方法打印出来一个。`AutoRouter`就是匹配任何的 HTTP 方法，所以最终会打印出来一堆内容：
```shell
MKCOL => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
CONNECT => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
POST => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
UNLOCK => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
PROPFIND => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
PATCH => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
GET => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
DELETE => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
PROPPATCH => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
COPY => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
OPTIONS => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
HEAD => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
LOCK => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
PUT => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
TRACE => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
MOVE => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]
```

我们用`POST => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]]`作为例子来展示该如何解读：
它表示的是，POST 方法访问 `/user/helloworld/*`这种模式的路径， 那么它会执行`main.UserController`里面的`HelloWorld`方法。

## 相关内容

- [admin后台查看路由注册信息](../admin/router.md)

