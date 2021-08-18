---
title: 函数式风格路由注册
lang: zh
---

# 函数式风格路由注册

该风格比较接近 Go 本身的语法特性，所以我们倾向于建议大家使用该路由注册方式。

使用该风格，非常简单，可以直接采用函数式的写法：
```go
func main() {
	web.Get("/hello", func(ctx *context.Context) {
		ctx.WriteString("hello, world")
	})

	web.Run()
}
```

注意，在函数式写法里面，我们只需要提供一个使用`*context.Context`参数的方法就可以。这个`context`不是 GO 的`context`包，而是 Beego 的`context`包。

大多数情况下，我们可能不太想这么写，那么我们可以在别的地方定义方法，然后再注册进来：
```go
func main() {

	web.Post("/post/hello", PostHello)

	web.Run()
}

func PostHello(ctx *context.Context) {
	ctx.WriteString("hello")
}
```

这可能会符合我们的一般习惯。

函数式注册，基本上就是各个 HTTP 方法都有一个对应的方法：
```
Get(rootpath string, f HandleFunc)
Post(rootpath string, f HandleFunc)
Delete(rootpath string, f HandleFunc)
Put(rootpath string, f HandleFunc)
Head(rootpath string, f HandleFunc)
Options(rootpath string, f HandleFunc)
Patch(rootpath string, f HandleFunc)
Any(rootpath string, f HandleFunc)
```

它们用法都是一样的，非常简单。

## 一些建议

在使用函数式注册的方式的时候，要面临的一个困难是，这些方法该如何组织。

在控制器风格里面，所有的方法天然被控制器所分割。举例来说，在一个简单的系统里面，我们可以有一个`UserController`，而后所有的和`User`有关的方法，都放在这个`Controller`里面；所有的和订单有关的方法，都可以放到`OrderController`里面。

因此从这个角度来看，`Controller`提供了一种自然的组织这些方法的方式。

那么在函数式风格里面，我们缺乏这样一个实体。

一种直觉的方式，是按照文件来组织。例如所有的用户相关的都放在自己项目的`api/user.go`里面；

如果方法更多，那么应该进一步考虑按照包来组织，也是我们所推荐的。例如在`api`之下创建一个`user`目录，所有的处理用户相关请求的方法都定义在这里；

最后一种方式，是自己定义一个`Controller`，但是这个`Controller`只起到一个组织代码的效果，并不是我们在控制器风格里面强调的那种。

例如我们完全可以不组合`web.Controller`写一个`Controller`：
```go
type UserController struct {

}

func (ctrl UserController) AddUser(ctx *context.Context) {
    // you business code
}
```
**这种`Controller`不能用于控制器风格的理由注册**。只是为了提供一种类似的方式来组织代码而已。

## 相关资源
[路由规则——正确撰写路由](../router_rule.md)

[命名空间——namespace](./name_space.md)