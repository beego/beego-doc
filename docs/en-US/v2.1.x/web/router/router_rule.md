---
title: Route Rules
lang: en-US
---

# Route Rules

Routing rules means, when we register a route, what kind of requests will be processed? And, if my request path contains parameters, how do I get the values?

First, we will match the `http` method first. For example, if you register only the `get` method for the path `api/user/*`, then that means that only `get` requests will be processed.

Second, after the `http` method is matched, we will further match the path.

In addition, in order to facilitate you to write the right route quickly, we are soliciting various routing rules to write here, please submit PR directly to github, attached to the last section of this page.

## Details

### Fixed Routes

For example `/api/user/update` means that only the request path is `http://your.com/api/user/update` will be matched, while something like `http://your.com/api/user/update/aa` will not be matched.

### `*` Routes

Example for route `/api/user/name/*`, all these path matched:
- `/api/user/name`
- `/api/user/name/tom`
- `/api/user/name/jerry/home`

That is, all path has prefix `/api/user/name` matched.

Another example `/api/*/name`, all these path matched:

- `/api/tom/name`
- `/api/tom/jerry/name`

This means that as long as there is at least one non-empty segment between `api` and `name`, it's matched.

So all these path will not be matched:

- `/api//name`
- `/api/name`

Be especially careful when `*` appears in the middle. For example when we have registered two routes `/api/*/name` and `/api/*/mid/name` at the same time:

- `/api/tom/mid/name` matches `/api/*/mid/name`
- `/api/mid/name` matches `/api/*/name`

We allow multiple `*` for example, `/api/*/name/*/detail`, all these path matched:

- `/api/tom/name/profile/detail`
- `/api/jerry/name/order/detail`

Practically speaking, we don't recommend using multiple `*`, it reflects the fact that the API is not really well designed. Under normal circumstances, it should only appear at the end.

Generally speaking appears in the middle section, mostly because this place is actually a parameter, such as the common RESTFul API in the form of routing: `/api/order/:id/detail`. It is the same as `/api/order/*/detail` in terms of implementation, but the former registers the expression of an ID in the middle, which clearly has a meaning.

Essentially, this kind of routing can be understood as a special kind of regular routing.

When we use this registration routing method, we can use `:splat` to get the data hit by `*`.

```go
// web.Router("/user/name/*", ctrl, "post:Post")
func (ctrl *MainController) Post() {

	username := ctrl.Ctx.Input.Param(":splat")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

If it is multi-segment, e.g. `/api/*/name/*/detail`, then `:splat` can only get the data of the last segment:

```go
// web.Router("/api/*/name/*/detail", ctrl, "post:Post")
func (ctrl *MainController) Post() {

	username := ctrl.Ctx.Input.Param(":splat")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

If accessing `http://localhost:8080/api/tom/name/oid123/detail`，we got `username=oid123

In summary, if you want to use `*`, we recommend that you should have only one `*` inside the whole route, and also try to avoid including parameter routes or regular routes. And the contents of `*` hits can be obtained by `:splat`.

### Path Variable Routes

The syntax is `:` followed by the name of the parameter in the path.

For example, `/api/:username/profile`。The route `:username` means that the data located between `api` and `profile` is the username, these path matched:

- `/api/flycash/profile`
- `/api/astaxie/profile`
- `/api/123456/profile`

But these not:

- `/api//profile`
- `/api/tom/jerry/profile`

You can get the value of `username` by:

```go
func (ctrl *MainController) Get() {

	username := ctrl.Ctx.Input.Param(":username")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

For `/api/:id`, `api/123` matches while `api/` not. If we want `api/` matched, we need to use route `/api/?:id`

### Regular Expression Route

Beego supports regular expression routes. This is a very powerful feature. In fact, the parameter routing we mentioned earlier can also be understood as a kind of regular expression routes. But the above parameter route is very much used in practice, so we list it separately in the documentation.

The syntax is `:param(reg)`, And `param` is the parameter name and you can obtain the value by `Ctx.Input.Param(":param")`. `reg` is the regular expression.

For example `/api/:id([0-9]+)`:

- `/api/123`: `id=123`
- `/api/tom`: DO NOT match

There are some builtin regular expression routes:

- `/:id:int`: `:int` equals to `[0-9]+`；
- `/:hi:string`: `:string` equals to `[\w]+`；

There are also some more complex uses of regular expressions, and we don't really recommend using these:

- `/cms_:id([0-9]+).html`
- `/download/\*.\*`: for example `/download/file/api.xml` matched, and `:path=file/api`, `:ext=xml`

However, being powerful means that learning costs are higher. We strongly recommend that you try to avoid using this type of complex routing, which is equivalent to leaking some of the business logic into the route registration, which is not a good design in itself.

## Examples

If you have written interesting routing rules, please submit them here so that they can help more people. :)

## Reference

[Input](../input/README.md)
