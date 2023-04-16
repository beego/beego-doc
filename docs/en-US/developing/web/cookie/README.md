---
title: Cookie
lang: en-US
---

# Cookie

[Cookie example](https://github.com/beego/beego-example/tree/master/httpserver/cookie)

## Basic Usage

- `GetCookie(key string)`
- `SetCookie(name string, value string, others ...interface{})`

Example:

```go
type MainController struct {
	web.Controller
}

func (ctrl *MainController) PutCookie() {
	// put something into cookie,set Expires time
	ctrl.Ctx.SetCookie("name", "web cookie", 10)

	// web-example/views/hello_world.html
	ctrl.TplName = "hello_world.html"
	ctrl.Data["name"] = "PutCookie"
	_ = ctrl.Render()
}

func (ctrl *MainController) ReadCookie() {
	// web-example/views/hello_world.html
	ctrl.TplName = "hello_world.html"
	ctrl.Data["name"] = ctrl.Ctx.GetCookie("name")
	// don't forget this
	_ = ctrl.Render()
}
```

`others` means：

- others[0]: `maxAge`, means `Expires` and `Max-Age`
- others[1]: `Path`, string, the default value is `/`
- others[2]: `Domain`, string
- others[3]: `Secure`, bool
- others[4]: `HttpOnly`, bool
- others[5]: `SameSite`, string

## Encryption

Beego provides two methods to assist with cookie encryption, it uses `sha256` as the encryption algorithm and `Secret` as the encryption key:

- `GetSecureCookie(Secret, key string) (string, bool)`
- `SetSecureCookie(Secret, name, value string, others ...interface{})`

```go
type MainController struct {
	web.Controller
}

func (ctrl *MainController) PutSecureCookie() {
	// put something into cookie, set Expires time
	ctrl.Ctx.SetSecureCookie("my-secret", "name", "web cookie")

	// web-example/views/hello_world.html
	ctrl.TplName = "hello_world.html"
	ctrl.Data["name"] = "PutCookie"
	_ = ctrl.Render()
}

func (ctrl *MainController) ReadSecureCookie() {
	// web-example/views/hello_world.html
	ctrl.TplName = "hello_world.html"
	ctrl.Data["name"], _ = ctrl.Ctx.GetSecureCookie("my-secret", "name")
	// don't forget this
	_ = ctrl.Render()
}
```

Please refer to above section to learn `others`.