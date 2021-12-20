---
title: Web 输出
lang: zh
---

# Web 输出

Beego 提供了多样化的 API 来帮助用户输出到客户端，支持 JSON，XML 或者 YAML 几种数据格式。

这些方法主要分布在`Controller`和`Context`上。

最为简单的输出方法是`WriteString`：
```go
ctrl.Ctx.WriteString("Hello")
```

## Controller 上的 Serve 方法
`web.Controller`上有很多个`Serve`方法，它们可以被用于输出 JSON，XML或者YAML 几种数据。

`Serve` 类方法使用起来分成两个步骤：首先设置 `Data`，其次刷新到前端。

- JSON 数据直接输出：

	```go
	func (this *AddController) Get() {
		mystruct := { ... }
		this.Data["json"] = &mystruct
		this.ServeJSON()
	}
	```
	调用 ServeJSON 之后，会设置 `content-type` 为 `application/json`，然后同时把数据进行 JSON 序列化输出。

- XML 数据直接输出：

	```go
	func (this *AddController) Get() {
		mystruct := { ... }
		this.Data["xml"]=&mystruct
		this.ServeXML()
	}
	```
	调用 ServeXML 之后，会设置 `content-type` 为 `application/xml`，同时数据会进行 XML 序列化输出。

- jsonp 调用

	```go
	func (this *AddController) Get() {
		mystruct := { ... }
		this.Data["jsonp"] = &mystruct
		this.ServeJSONP()
	}
	```
	调用 ServeJSONP 之后，会设置 `content-type` 为 `application/javascript`，然后同时把数据进行 JSON 序列化，然后根据请求的 callback 参数设置 jsonp 输出。

### 根据 Accept 输出响应数据

一般而言，我们是建议后端直接指定响应数据的格式。比如说在一个应用里面直接使用 JSON 格式作为数据输入和输出。

但是有些时候我们不得不兼容多种数据格式，那么就可以考虑使用`SetData`方法和`ServeFormatted`方法。例如：
```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.SetData(&mystruct)
    this.ServeFormatted()
}
```
这两个都是依据 HTTP 请求中的 `Accept` 这个头部字段来推断应该输出什么格式的数据作为响应。如果没有 `Accept` 头部，或者无法解析该字段，会默认输出 JSON 格式的数据。


## Context 上的输出响应的方法

如果使用了函数式的路由风格，也就是意味着我们没有`Controller`使用。这个时候可以考虑使用`Context`上的方法。

`Context` 上的方法使用起来比较简单，例如输出 JSON：
```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.Ctx.JSONResp(&mystruct)
}
```

包含 JSON 在内，还有一些方法。这些方法都接收一个`interface`作为输入，并且尝试将输入序列化。也就是说，如果输入就直接是一个字符串，那么应该考虑用`WriteString`方法：
- `JSONResp(data interface{}) error`: 输出 JSON 格式数据
- `YamlResp(data interface{}) error`: 输出 YAML 格式，同样，Beego 会尝试将`data`转化为`yaml`字符串。如果`data`本身就是字符串，那么应该考虑用`WriteString`；
- `ProtoResp(data proto.Message)`: 输出`protobuf`格式的数据；
- `XMLResp(data interface{}) error`：输出 XML 格式的数据；

### 根据 Accept 输出响应数据

如果希望根据 HTTP 请求里面的 `Accept` 字段来输出响应数据，那么应该使用`Resp`方法：
```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.Ctx.Resp(&mystruct)
}
```
如果没有`Accept`头部，或者无法解析，那么会使用 JSON 输出数据。






