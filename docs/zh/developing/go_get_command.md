---
title: Go Get 命令指南
lang: zh
---

# Get 命令

## 使用特定版本
我们一般用 `go get` 命令来获取依赖。例如在项目根目录下执行：
```shell
go get github.com/beego/beego/v2@v2.0.1
```
将拉去版本号为 `v2.0.1` 的代码。在`github`上，这部分的代码对应于`github`中`tag`为`v2.0.1`的源代码。

具体可用的版本号，可以参考[Beego tags](https://github.com/beego/beego/tags)

## 使用最新稳定版本
如果你需要拉取最新稳定版的`Beego`代码，可以执行：
```shell
go get github.com/beego/beego/v2@latest
```

## 特定分支代码
在某些情况下，你可能需要拉取特定分支的代码，例如你想要在项目里面使用`develop`分支代码：
```shell
go get -u github.com/beego/beego/v2@develop
```
注意，我们使用了`-u`选项，那么意味着，我们将依赖更新到了`develop`的最新提交。

普遍上，我们的`master`分支包含了一些紧急的`BUG fixed`，所以可以通过执行：
```shell
go get -u github.com/beego/beego/v2@master
```
请不要遗漏`-u`选项，否则`go get`可能使用本地已经缓存的代码，而未能执行更新。
