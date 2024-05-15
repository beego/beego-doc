---
title: Web 路由规则
lang: zh
---

# 路由规则

路由规则是指，当我们注册了一个路由的时候，什么样的请求才会被处理？并且，如果我的请求路径里面含有参数信息，那么我该怎么从路径里面拿出来参数？

首先，我们会首先匹配`http`方法。例如，如果你对于路径`api/user/*`只注册了`get`方法，那么意味着，只有`get`请求，才会被处理。

其次，在`http`方法匹配上之后，我们会进一步匹配路径。

此外，为了方便大家快速写对路由，我们在这里征集各种路由规则的写法，请直接提交 PR 到 github，附在本页面的最后章节。

## 路由规则详解

### 固定路由

固定匹配表示只匹配特定路由，也可以理解为完全匹配，即你的路径和你注册的路径必须一模一样，否则不会命中。

例如`/api/user/update`代表只有请求路径是`http://your.com/api/user/update`会被匹配，而类似`http://your.com/api/user/update/aa`则不会被匹配。

### `*` 匹配

在 Beego 里面，可以用`*`来表达匹配一段路由。

例如注册`/api/user/name/*`，以下这些路径都能命中该路径：

- `/api/user/name`
- `/api/user/name/tom`
- `/api/user/name/jerry/home`

即，只要前缀符合`/api/user/name`，那么就会命中。

当然，`*`也可以出现在中间，例如我们注册一个路由`/api/*/name`，那么以下这些路径都能命中：

- `/api/tom/name`
- `/api/tom/jerry/name`

这意味着只要`api`和`name`之间至少存在一段非空路径，就会命中。

特别地，以下这种路径，将不会命中：

- `/api//name`
- `/api/name`

当`*`出现在中间的时候，要尤其小心。例如当我们同时注册了两个路由`/api/*/name` 和 `/api/*/mid/name`的时候：

- `/api/tom/mid/name`将命中`/api/*/mid/name`
- `/api/mid/name`将命中`/api/*/name`

从这个例子也可以看出来，Beego 匹配遵循了最精确匹配的原则。

我们允许一个路由里面含有多个`*`。例如我们注册了一个路由`/api/*/name/*/detail`，那么以下路径会命中：

- `/api/tom/name/profile/detail`
- `/api/jerry/name/order/detail`

从实践上来说，我们是不推荐大家使用多段`*`的，它体现的是 API 其实并没有设计得很好。正常的情况下，它应该只出现在末尾。

一般来说出现在中段，多半是因为这个地方其实是一个参数，例如常见的 RESTFul API 的路由形式：`/api/order/:id/detail`。它和 `/api/order/*/detail`从实现上来说，效果是一样的，但是前者注册的表达的是中间是一个 ID，明确有含义，而后者，只是为了匹配特定的路由而已。

本质上来说，可以将这种路由理解为一种特殊的正则路由。

当我们使用这种注册路由方式的时候，我们可以使用`:splat`来获得`*`所命中的数据：

```go
// web.Router("/user/name/*", ctrl, "post:Post")
func (ctrl *MainController) Post() {

	username := ctrl.Ctx.Input.Param(":splat")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

如果是多段的，例如`/api/*/name/*/detail`，那么`:splat`只能获得最后一段的数据：

```go
// web.Router("/api/*/name/*/detail", ctrl, "post:Post")
func (ctrl *MainController) Post() {

	username := ctrl.Ctx.Input.Param(":splat")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

如果我们输入的路径是`http://localhost:8080/api/tom/name/oid123/detail`，那么我们最终得到的`username`是`oid123`

总结一下：如果要使用`*`匹配，我们建议在整个路由里面应该只有一个`*`，也尽量避免包含参数路由或者正则路由。并且`*`命中的内容，可以通过`:splat`来获得。

### 参数路由

Beego 支持参数路由，或者说 Ant 风格的路由。它通常见于 RESTFul 风格的 API 中。其语法是在路径之中以`:`后面跟着参数的名字。

比如典型的例子：`/api/:username/profile`。该路由`:username`是指，位于`api`和`profile`之间的数据，是用户名。`/api/:username/profile` 能够命中：

- `/api/flycash/profile`
- `/api/astaxie/profile`
- `/api/123456/profile`

但是无法命中：

- `/api//profile`
- `/api/tom/jerry/profile`

中间的 `username` 参数可以通过 Beego 提供的 API 来获取：

```go
func (ctrl *MainController) Get() {

	username := ctrl.Ctx.Input.Param(":username")

	ctrl.Ctx.WriteString("Your router param username is:" + username)
}
```

另外一个例子`/api/:id`，它能够命中`api/123`，但是无法命中`api/`。如果我们想要命中`api/`那么我们需要修改路由为：`/api/?:id`。注意`/api/?:id`和`/api/:id`的区别。后者要求在`api`之后必须要要再跟着一段路径，否则不会匹配。

### 正则路由

Beego 支持正则路由。这是一个功能很强大的特性。其实，我们前面提到的参数路由，也可以理解为是正则路由的一种。只不过上面的参数路由实际中使用非常多，所以我们单独在文档中列出来讨论。

正则路由的核心语法是`:param(reg)`。其中`param`是参数名字，你可以通过`Ctx.Input.Param(":param")`来获取值。而`reg`则是正则表达式。我们看一个例子`/api/:id([0-9]+)`这里表示，只有命中了路由规则的`[0-9]+`的路径才会被认为是`id`的值。因此：

- `/api/123` 中`id`的值是`123`
- `/api/tom` 则无法命中这条路由，因为`tom`不符合规则`[0-9]+`

鉴于大部分时候，我们使用的正则表达式并不会很多，所以我们内置了一些：

- `/:id:int`。`:int`和`[0-9]+`是等价的；
- `/:hi:string`。`:string`和`[\w]+`是等价的；

还有一些比较复杂的正则表达式用法，我们不太推荐大家使用这些东西

- `/cms_:id([0-9]+).html`：这种方式，是在路径的中间加入一个正则表达式，某些场景下会很好用;
- `/download/\*.\*`：这种相当于我们帮你解析了一个文件路径，例如`/download/file/api.xml`可以匹配成功，此时变量`:path`值为`file/api`， `:ext`值为`xml`，在需要处理文件的场景下会有用；

但是，功能强大则意味着学习成本比较高。我们强烈建议大家尽量避免使用这一类复杂的路由，这相当于将部分业务逻辑泄露到了路由注册中，这本身就不是一个很好的设计。

## 例子

如果你写过有趣的路由规则，请提交上来这里，那么可以帮助到更加多的人。:)

## 相关内容

[读取数据](../context/README.md)
