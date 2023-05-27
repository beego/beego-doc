---
title: Ouput
lang: en-US
---

# Output

Beego provides a variety of APIs to help users export to the client, supporting several data formats such as JSON, XML or YAML.

These methods are mainly defined on `Controller` and `Context`.

For example, `WriteString`：

```go
ctrl.Ctx.WriteString("Hello")
```

## Controller Serve

`Controller` has a number of `Serve` methods that can be used to output JSON, XML or YAML data.

The `Serve` class method is used in two steps: first, setting up the `Data`, and second, refreshing to the front-end.

- JSON：

  ```go
  func (this *AddController) Get() {
  	mystruct := { ... }
  	this.Data["json"] = &mystruct
  	this.ServeJSON()
  }
  ```

  When ServeJSON is called, `content-type` is set to `application/json`, and the data is output JSON serialized at the same time.

- XML: 

  ```go
  func (this *AddController) Get() {
  	mystruct := { ... }
  	this.Data["xml"]=&mystruct
  	this.ServeXML()
  }
  ```

  After calling ServeXML, the `content-type` is set to `application/xml`, and the data is serialized for XML output.

- jsonp

  ```go
  func (this *AddController) Get() {
  	mystruct := { ... }
  	this.Data["jsonp"] = &mystruct
  	this.ServeJSONP()
  }
  ```

  After calling ServeJSONP, the `content-type` is set to `application/javascript`, and then the data is JSON serialized at the same time, and then the jsonp output is set according to the callback parameter of the request.

### Based On Accept Header

In general, we do recommend that the backend directly specify the format of the response data. For example, using JSON format directly as data input and output inside an application.

But there are times when we have to be compatible with multiple data formats, so consider using the `SetData` method and the `ServeFormatted` method. For example:

```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.SetData(&mystruct)
    this.ServeFormatted()
}
```

Both are based on the `Accept` header field in the HTTP request to infer what format of data should be output as a response. If there is no `Accept` header, or if the field cannot be parsed, JSON formatted data will be output by default.

## Context Methods

If a functional routing style is used, that means we don't have a `Controller` to use. This is the time to consider using the methods on `Context`.

Example:

```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.Ctx.JSONResp(&mystruct)
}
```

These methods all take an `interface` as input and try to serialize the input. That is, if the input is a string, then the `WriteString` method should be considered.

- `JSONResp(data interface{}) error`
- `YamlResp(data interface{}) error`
- `ProtoResp(data proto.Message)`
- `XMLResp(data interface{}) error`

### Based On Accept Header

If you want to output response data based on the `Accept` field inside the HTTP request, then you should use the `Resp` method:

```go
func (this *AddController) Get() {
    mystruct := { ... }
    this.Ctx.Resp(&mystruct)
}
```

If there is no `Accept` header, or if it cannot be parsed, then the data will be output using JSON.
