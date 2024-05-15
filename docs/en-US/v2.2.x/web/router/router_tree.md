---
title: Print Routes
lang: en-US
---

# Print Routes

Using =`web.PrintTree()` to print all routes:

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

If you register a route that uses `*` as a method, which means it matches any HTTP method, then it will print out one for each method. The `AutoRouter` is the one that matches any HTTP method, so it will end up printing out a bunch of things.

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

Let's use `POST => &[[/user/helloworld/* map[*:HelloWorld] main.UserController]` as an example to show how to interpret.
It means that the POST method accesses the path of the pattern `/user/helloworld/*`, then it will execute the `HelloWorld` method inside `main.UserController`.

## Reference

- [admin service](../admin/README.md)
