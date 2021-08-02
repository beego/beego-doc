---
title: Web 路由规则
lang: zh
---

# 路由规则

路由规则是指，当我们注册了一个路由的时候，什么样的请求才会被处理？并且，如果我的请求路径里面含有参数信息，那么我该怎么从路径里面拿出来参数？

首先，我们会首先匹配`http`方法。例如，如果你对于路径`api/user/*`只注册了`get`方法，那么意味着，只有`get`请求，才会被处理。

其次，在`http`方法匹配上之后，我们会进一步匹配路径。

此外，为了方便大家快速写对路由，我们在这里征集各种路由规则的写法，请直接提交 PR 到github，附在本页面的最后章节。

## 路由规则详解

### 固定路由

固定匹配表示只匹配特定路由，也可以理解为完全匹配，即你的路径和你注册的路径必须一模一样，否则不会命中。

例如`api/user/update`代表只有请求路径是`http://your.com/api/user/update`会被匹配，而类似`http://your.com/api/user/update/aa`则不会被匹配。

### `*` 匹配

在 Beego 里面，可以用`*`来表达匹配一段路由。

例如注册`api/user/name/*`，以下这些路径都能命中该路径：

- `api/user/name`
- `api/user/name/tom`
- `api/user/name/jerry/home`

即，只要前缀符合`api/user/name`，那么就会命中。

当然，`*`也可以出现在中间，例如我们注册一个路由`api/*/name`，那么以下这些路径都能命中：

- `api/tom/name`
- `api/tom/jerry/name`

这意味着只要`api`和`name`之间至少存在一段非空路径，就会命中。

特别地，以下这种路径，将不会命中：

- `api//name`
- `api/name`

当`*`出现在中间的时候，要尤其小心。例如当我们同时注册了两个路由`api/*/name` 和 `api/*/mid/name`的时候：

- `api/tom/mid/name`将命中`api/*/mid/name`
- `api/mid/name`将命中`api/*/name`

从这个例子也可以看出来，Beego 匹配遵循了最精确匹配的原则。

我们允许一个路由里面含有多个`*`。例如我们注册了一个路由`api/*/name/*/detail`，那么以下路径会命中：

- `api/tom/name/profile/detail`
- `api/jerry/name/order/detail`

一般从实践上来说，我们是不推荐大家使用多段`*`的，它体现的是 API 其实并没有设计得很好。正常的情况下，它应该只出现在末尾。

一般来说出现在中段，多半是因为这个地方其实是一个参数，例如常见的 RESTFul API 的路由形式：`api/order/:id/detail`。它和 `api/order/*/detail`从实现上来说，效果是一样的，但是前者注册的表达的是中间是一个 ID，明确有含义，而后者，只是为了匹配特定的路由而已。

### 参数路由

Beego 支持参数路由，或者说 Ant 风格的路由。它通常见于 RESTFul 风格的 API 中。比如典型的例子：`api/:username/profile`。该路由`:username`是指，位于`api`和`profile`之间的数据，是用户名。`api/:username/profile` 能够命中：
- `api/flycash/profile`
- `api/astaxie/profile` 
- `api/123456/profile`

但是无法命中：
- `api//profile`
- `api/tom/jerry/profile`

中间的 `username` 参数可以通过 Beego 提供的 API 来获取。

### 正则路由

Beego 支持正则路由。这是一个功能很强大的特性。

但是正如前面提到，功能强大则意味着学习成本比较高。我们只建议大家在必要的时候启用正则路由，因为前面提到的注册路由方式，能够满足绝大部分场景。

## 例子

如果你写过有趣的路由规则，请提交上来这里，那么可以帮助到更加多的人。:)