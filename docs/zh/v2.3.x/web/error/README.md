---
title: 错误处理
lang: zh
---

# 错误处理

我们在做 Web 开发的时候，经常需要页面跳转和错误处理，Beego 这方面也进行了考虑，通过 `Redirect` 方法来进行跳转：

```go
func (this *AddController) Get() {
	this.Redirect("/", 302)
}
```

如何中止此次请求并抛出异常，Beego 可以在控制器中这样操作：

```go
func (this *MainController) Get() {
	this.Abort("401")
	v := this.GetSession("asta")
	if v == nil {
		this.SetSession("asta", int(1))
		this.Data["Email"] = 0
	} else {
		this.SetSession("asta", v.(int)+1)
		this.Data["Email"] = v.(int)
	}
	this.TplName = "index.tpl"
}
```

这样 `this.Abort("401")` 之后的代码不会再执行，而且会默认显示给用户如下页面：

![](./img/401.png)

web 框架默认支持 401、403、404、500、503 这几种错误的处理。用户可以自定义相应的错误处理，例如下面重新定义 404 页面：

```go
func page_not_found(rw http.ResponseWriter, r *http.Request){
	t,_:= template.New("404.html").ParseFiles(web.BConfig.WebConfig.ViewsPath+"/404.html")
	data :=make(map[string]interface{})
	data["content"] = "page not found"
	t.Execute(rw, data)
}

func main() {
	web.ErrorHandler("404",page_not_found)
	web.Router("/", &controllers.MainController{})
	web.Run()
}
```

我们可以通过自定义错误页面 `404.html` 来处理 404 错误。

Beego 更加人性化的还有一个设计就是支持用户自定义字符串错误类型处理函数，例如下面的代码，用户注册了一个数据库出错的处理页面：

```go
func dbError(rw http.ResponseWriter, r *http.Request){
	t,_:= template.New("dberror.html").ParseFiles(web.BConfig.WebConfig.ViewsPath+"/dberror.html")
	data :=make(map[string]interface{})
	data["content"] = "database is now down"
	t.Execute(rw, data)
}

func main() {
	web.ErrorHandler("dbError",dbError)
	web.Router("/", &controllers.MainController{})
	web.Run()
}
```

一旦在入口注册该错误处理代码，那么你可以在任何你的逻辑中遇到数据库错误调用 `this.Abort("dbError")` 来进行异常页面处理。

## Controller 定义 Error

从 1.4.3 版本开始，支持 Controller 方式定义 Error 错误处理函数，这样就可以充分利用系统自带的模板处理，以及 context 等方法。

```go
package controllers

import (
	"github.com/beego/beego/v2/server/web"
)

type ErrorController struct {
	web.Controller
}

func (c *ErrorController) Error404() {
	c.Data["content"] = "page not found"
	c.TplName = "404.tpl"
}

func (c *ErrorController) Error501() {
	c.Data["content"] = "server error"
	c.TplName = "501.tpl"
}


func (c *ErrorController) ErrorDb() {
	c.Data["content"] = "database is now down"
	c.TplName = "dberror.tpl"
}
```

通过上面的例子我们可以看到，所有的函数都是有一定规律的，都是 `Error` 开头，后面的名字就是我们调用 `Abort` 的名字，例如 `Error404` 函数其实调用对应的就是 `Abort("404")`

我们就只要在 `web.Run` 之前采用 `web.ErrorController` 注册这个错误处理函数就可以了

```go
package main

import (
	_ "btest/routers"
	"btest/controllers"

	"github.com/Beego/Beego/v2/server/web"
)

func main() {
	web.ErrorController(&controllers.ErrorController{})
	web.Run()
}
```

## 从 panic 中恢复

如果你希望用户在服务器处理请求过程中，即便发生了 panic 依旧能够返回响应，那么可以使用 Beego 的恢复机制。该机制是默认开启的。依赖于配置项：

```go
web.BConfig.RecoverPanic = true
```

如果你需要关闭，那么将这个配置项设置为`false`就可以。

如果你想自定义`panic`之后的处理行为，那么可以重新设置`web.BConfig.RecoverFunc`。

例如：

```go
	web.BConfig.RecoverFunc = func(context *context.Context, config *web.Config) {
		if err := recover(); err != nil {
			context.WriteString(fmt.Sprintf("you panic, err: %v", err))
		}
	}
```

千万要注意：你永远需要检测`recover`的结果，并且将从`panic`中恢复过来的逻辑放在检测到`recover`返回不为`nil`的代码里面。

## 相关内容

-[Controller API - 中断](../router/ctrl_style/controller.md)
