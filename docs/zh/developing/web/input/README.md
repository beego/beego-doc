---
title: Web 输入处理
lang: zh
---

# 输入处理
总体来说，处理输入主要依赖于 `Controller` 提供的方法。而具体输入可以来源于：
- 路径参数：这一部分主要是指[参数路由](../router/router_rule.md)
- 查询参数
- 请求体：要想从请求体里面读取数据，大多数时候将`BConfig.CopyRequestBody` 设置为`true`就足够了。而如果你是创建了多个 `web.Server`，那么必须每一个`Server`实例里面的配置都将`CopyRequestBody`设置为`true`了

而获取参数的方法可以分成两大类：
- 第一类是以 Get 为前缀的方法：这一大类的方法，主要获得某个特定参数的值
- 第二类是以 Bind 为前缀的方法：这一大类的方法，试图将输入转化为结构体

## Get 类方法

针对这一类方法，Beego 主要从两个地方读取：查询参数和表单，如果两个地方都有相同名字的参数，那么 Beego 会返回表单里面的数据。例如最简单的例子：
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
当我们访问：
- 路径 `localhost:8080?name=a`: 这是使用查询参数的形式，那么会输出 `Hello, a`
- 路径 `localhost:8080`，而后表单里面提交了`name=b`，那么会输出`b`
- 路径 `localhost:8080?name=a`，并且表单提交了`name=b`，那么会输出`b`

这一类的方法也允许传入默认值，例如：
```go
func (ctrl *MainController) Get() {
	name := ctrl.GetString("name", "Tom")
	ctrl.Ctx.WriteString("Hello " + name)
}
```
如果我们没有传入`name`参数，那么就会使用`Tom`作为`name`的值，例如我们访问`GET localhost:8080`的时候，就会输出 `Hello Tom`。

需要注意的是，`GetString`的方法签名是：
```go
func (c *Controller) GetString(key string, def ...string) string {
    // ...
}
```
要注意的是，虽然`def`被声明为不定参数，但是实际上，Beego 只会使用第一个默认值，后面的都会被忽略。

这一类方法签名和行为都是类似的，它们有：

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

这里要注意到，`GetString` 和 `GetStrings` 本身在设计的时候并没有设计返回 `error`，所以无法拿到错误。


## Bind 类方法
大多数时候，我们还需要把输入转换为结构体，Beego 提供了一系列的方法来完成输入到结构体的绑定。

这部分方法是直接定义在 `Context` 结构体上的，所以用户可以直接操作 `Context` 实例。为了简化操作，我们在`Controller`上也定义了类似的方法。

例如：

```go

// 要设置 web.BConfig.CopyRequestBody = true

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

`Bind`这一大类有多个方法：
- `Bind(obj interface{}) error`: 默认是依据输入的 `Content-Type`字段，来判断该如何反序列化；
- `BindYAML(obj interface{}) error`: 处理`YAML`输入
- `BindForm(obj interface{}) error`: 处理表单输入
- `BindJSON(obj interface{}) error`: 处理`JSON`输入
- `BindProtobuf(obj proto.Message) error`: 处理`proto`输入
- `BindXML(obj interface{}) error`: 处理`XML`输入

在使用特定格式的输入的时候，别忘记设置标签（`Tag`），例如我们例子里面的`json:"age"`，不同格式的输入，其标签是不是一样的。

需要注意的是，虽然我们提供了一个根据`Content-Type`来判断如何绑定的，但是我们更加推荐用户使用指定格式的绑定方法。

> 一个接口，应该只接收特定某种格式的输入，例如只接收 JSON，而不应该可以处理多种输入

在早期，Beego 还有一个类似于`BindForm`的方法：`ParseForm(obj interface{}) error`，这两个方法效果是一致的。

## 路径参数

我们在[路由定义——参数路由](../router/router_rule.md)里面介绍过了如何获取路径参数。

## 早期 Bind 方法

在 Beego 的`Input`中定义了一系列的方法，用于读取参数。这一类方法很类似于 `Get` 一族的方法。所以用户可以酌情使用。

例如请求地址如下

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

# 相关内容
- [路由定义——参数路由](../router/router_rule.md)
- [文件上传](../file/README.md)
