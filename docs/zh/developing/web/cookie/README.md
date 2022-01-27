---
title: Cookie 处理
lang: zh
---

# Cookie 处理

这部分的例子在[Cookie example](https://github.com/beego/beego-example/tree/master/httpserver/cookie)

## 普通 Cookie 处理

Beego 通过`Context`直接封装了对普通 Cookie 的处理方法，可以直接使用：

- `GetCookie(key string)`
- `SetCookie(name string, value string, others ...interface{})`

例子：

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

`others`参数含义依次是：

- 第一个代表 `maxAge`，Beego 使用这个值计算`Expires`和`Max-Age`两个值
- 第二个代表`Path`，字符串类型，默认值是`/`
- 第三个代表`Domain`，字符串类型
- 第四个代表`Secure`，布尔类型
- 第五个代表`HttpOnly`，布尔类型
- 第六个代表`SameSite`，字符串类型

## 加密 Cookie 处理

Beego 提供了两个方法用于辅助 Cookie 加密处理，它采用了`sha256`来作为加密算法，下面`Secret`则是加密的密钥：

- `GetSecureCookie(Secret, key string) (string, bool)`：用于从 Cookie 中读取数据
- `SetSecureCookie(Secret, name, value string, others ...interface{})`：用于写入数据到 Cookie。

```go
type MainController struct {
	web.Controller
}

func (ctrl *MainController) PutSecureCookie() {
	// put something into cookie,set Expires time
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

`others`参数和普通 Cookie 一样。
