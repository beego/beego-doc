---
title: What does CopyRequestBody mean?
lang: en-US
---

# What does CopyRequestBody mean?

In the Beego web configuration, there is a very confusing parameter called `CopyRequestBody`. It is in the structure `web.Config`.

This parameter was introduced for purpose: Beego reads the HTTP request body data and performs some processing. Also, after Beego reads it, the user can read it again.

There are two examples.

The first example with `CopyRequestBody = true`

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

When we access `localhost:8080` and pass in the parameters, we can get the response:
![CopyRequestBody=true](./img/qa/copy_request_body_true.png)

If we set `CopyRequestBody` to `false`:

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

Then we will find that we cannot read the data from inside the request body:
![CopyRequestBody=false](./img/qa/copy_request_body_false.png)

So, be aware that you should set `CopyRequestBody` to `true` if you intend to rely on Beego to process the request.

`CopyRequestBody` should be considered a bit cumbersome by today's eyes. But the advantage of it is that you can read the data from Beego multiple times. After all, the `Body` field inside `http.Request` can only be read once.

In that sense, it's worth keeping for now. But we are considering to set its default value to `true` instead of `false` in the future.
