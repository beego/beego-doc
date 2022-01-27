---
title: CopyRequestBody 参数
lang: zh
---

# CopyRequestBody 参数

在 Beego web 的配置中，有一个很让人困惑的参数，叫做`CopyRequestBody`。它是在结构体`web.Config`中。

该参数的引入主要有两个目的：

- Beego 读取 HTTP 请求体数据，并进行一些处理。同时，在 Beego 读取之后，用户还可以再次读取；
-

我们可以通过两个例子来感受一下`CopyRequestBody`的效果。

第一个例子是我们开启了`CopyRequestBody`：

```go

func main() {
	web.BConfig.CopyRequestBody = true
	web.CtrlPost("/hello", (*MainController).ReadDataFromBody)
	web.Run()
}

type MainController struct {
	web.Controller
}

func (m *MainController) ReadDataFromBody() {
	u := &user{}
	err := m.Controller.BindJson(u)
	if err != nil {
		logs.Error("could not bind json data: %v", err)
	}
	err = m.JsonResp(u)
	if err != nil {
		logs.Error("could not write json resp: %v", err)
	}
}
```

当我们访问`localhost:8080`并且传入参数之后，我们能够得到响应:
![CopyRequestBody=true](../../../img/qa/copy_request_body_true.png)

如果我们将`CopyRequestBody`设置为`false`：

```go
func main() {
	web.BConfig.CopyRequestBody = false
	web.CtrlPost("/hello", (*MainController).ReadDataFromBody)
	web.Run()
}

type MainController struct {
	web.Controller
}

func (m *MainController) ReadDataFromBody() {
	u := &user{}
	err := m.Controller.BindJson(u)
	if err != nil {
		logs.Error("could not bind json data: %v", err)
	}
	err = m.JsonResp(u)
	if err != nil {
		logs.Error("could not write json resp: %v", err)
	}
}
```

那么我们会发现，我们无法从请求体里面读到数据了：
![CopyRequestBody=false](../../../img/qa/copy_request_body_false.png)

所以，要注意的是，如果你打算依赖于 Beego 来处理请求，那么应该把`CopyRequestBody`设置为`true`。

`CopyRequestBody`以当下的眼光看过去，应该算是有点累赘了。不过它的好处就在于，你可以多次从 Beego 中读取数据。毕竟`http.Request`里面的`Body`字段，只能读取一次。

从这个意义上来说，目前也还算是值得保留下去。但是我们考虑会在将来把它的默认值设置为`true`，而不是`false`。
