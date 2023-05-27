---
title: Input
lang: en-US
---

# Input

In general, processing input relies heavily on the methods provided by the `Controller`. And specific inputs can be found in:

- Path variable: refer to [router](../router/router_rule.md)
- Query parameter
- Body: To read data from the request body, for most cases setting `BConfig.CopyRequestBody` to `true` is enough. If you create more than one `web.Server`, then you must set `CopyRequestBody` to `true` in each `Server` instance

And the methods of obtaining parameters can be divided into two main categories:

- Methods prefixed with Get: this is a large category of methods that try to get the value of a particular parameter
- Methods prefixed with Bind: this is a large category of methods that attempt to convert input into a structure

## Get

For this type of method, Beego reads from two main places: the query parameters and the form. If there are parameters with the same name in both places, then Beego returns the data inside the form. For example:

```go
type MainController struct {
	web.Controller
}

func (ctrl *MainController) Post() {
	name := ctrl.GetString("name")
	if name == "" {
		ctrl.Ctx.WriteString("Hello World")
		return
	}
	ctrl.Ctx.WriteString("Hello " + name)
}
```

When we access.

- Path `localhost:8080?name=a`, it will output `Hello, a`
- Path `localhost:8080` and the form is submitted with `name=b`, then the output will be `b`
- Path `localhost:8080?name=a` and the form is submitted with `name=b`, then `b` will be output

Methods in this category also allow default values to be passed in:

```go
func (ctrl *MainController) Get() {
	name := ctrl.GetString("name", "Tom")
	ctrl.Ctx.WriteString("Hello " + name)
}
```

If we don't pass the `name` parameter, then `Tom` will be used as the value of `name`, for example when we access `GET localhost:8080`, it will output `Hello Tom`.

It should be noted that the method signature of `GetString` is:

```go
func (c *Controller) GetString(key string, def ...string) string {
    // ...
}
```

Note that although `def` is declared as a variable parameter, in practice, Beego will only use the first default value, and all subsequent ones will be ignored.

The method signatures and behaviors are similar for this class, they are:

- `GetString(key string, def ...string) string`
- `GetStrings(key string, def ...[]string) []string`
- `GetInt(key string, def ...int) (int, error)`
- `GetInt8(key string, def ...int8) (int8, error)`
- `GetUint8(key string, def ...uint8) (uint8, error)`
- `GetInt16(key string, def ...int16) (int16, error)`
- `GetUint16(key string, def ...uint16) (uint16, error)`
- `GetInt32(key string, def ...int32) (int32, error)`
- `GetUint32(key string, def ...uint32) (uint32, error)`
- `GetInt64(key string, def ...int64) (int64, error)`
- `GetUint64(key string, def ...uint64) (uint64, error)`
- `GetBool(key string, def ...bool) (bool, error)`
- `GetFloat(key string, def ...float64) (float64, error)`

Note that `GetString` and `GetStrings` themselves are not designed to return `error`, so you can't get an error.

## Bind

Most of the time, we also need to convert the input to a structure, and Beego provides a series of methods to do the input-to-structure binding.

This part of the method is defined directly on the `Context` structure, so the user can manipulate the `Context` instance directly. To simplify the operation, we have defined similar methods on the `Controller`.

```go

// set web.BConfig.CopyRequestBody = true

type MainController struct {
	web.Controller
}

func (ctrl *MainController) Post() {
	user := User{}
	err := ctrl.BindJSON(&user)
	if err != nil {
		ctrl.Ctx.WriteString(err.Error())
		return
	}
	ctrl.Ctx.WriteString(fmt.Sprintf("%v", user))
}

type User struct {
	Age  int    `json:"age"`
	Name string `json:"name"`
}
```


- `Bind(obj interface{}) error`: Based on `Content-Type`
- `BindYAML(obj interface{}) error`
- `BindForm(obj interface{}) error`
- `BindJSON(obj interface{}) error`
- `BindProtobuf(obj proto.Message) error`
- `BindXML(obj interface{}) error`


Note that although we provide a way to determine how to bind based on `Content-Type`, we prefer users to use the bind method that specifies the format.

> An API that should only accept input in a particular format, such as JSON only, and should not be able to handle multiple inputs

In the early days, Beego also had a method similar to `BindForm`: `ParseForm(obj interface{}) error`, both of which have the same effect.

## Path Variable

Refer to [Path Variable Router ](../router/router_rule.md)

## Historical Bind methods

In Beego's `Input` there is a family of methods defined for reading parameters. This class of methods is very similar to the `Get` family of methods.

Example:

```url
?id=123&isok=true&ft=1.2&ol[0]=1&ol[1]=2&ul[]=str&ul[]=array&user.Name=astaxie
```

```go
var id int
this.Ctx.Input.Bind(&id, "id")  //id ==123

var isok bool
this.Ctx.Input.Bind(&isok, "isok")  //isok ==true

var ft float64
this.Ctx.Input.Bind(&ft, "ft")  //ft ==1.2

ol := make([]int, 0, 2)
this.Ctx.Input.Bind(&ol, "ol")  //ol ==[1 2]

ul := make([]string, 0, 2)
this.Ctx.Input.Bind(&ul, "ul")  //ul ==[str array]

user struct{Name}
this.Ctx.Input.Bind(&user, "user")  //user =={Name:"astaxie"}
```

## Reference

- [Path Variable Router](../router/router_rule.md)
- [File Handling](../file/README.md)
