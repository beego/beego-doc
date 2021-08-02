---
title: Web 模块
lang: zh
sidebar: auto
---

# Web 模块

在这里，我们都是启用了编程模式，即不会依赖于配置文件。使用配置文件的请参考模块的[配置说明和配置例子](config.md)，几乎全部参数，都可以通过配置文件来解决。

## 快速开始

搭建一个 Web 服务器非常简单，只需要在代码中写下：
```go
import (
	"github.com/beego/beego/v2/server/web"
)

func main() {
	// now you start the beego as http server.
	// it will listen to port 8080
	web.Run()
}
```
在这种情况下，Web 服务器将使用`8080`端口，所以启动之前请确认该端口没有被占用。

完整例子[Web 模块基础用法](https://github.com/beego/beego-example/blob/master/httpserver/basic/main.go)

## 基础配置

### 端口
如果你希望指定服务器的端口，那么可以在启动的时候传入端口：
```go
import (
    "github.com/beego/beego/v2/server/web"
)

func main() {
	// now you start the beego as http server.
	// it will listen to port 8081
	web.Run(":8081")
}
```

这是我们推荐的写法。

### 主机和端口
一般我们不推荐这种写法，因为这看起来很奇诡，即：
```go
import (
    "github.com/beego/beego/v2/server/web"
)

func main() {
	// now you start the beego as http server.
	// it will listen to port 8081
	web.Run("localhost:8081")
	// or
	web.Run("127.0.0.1:8081")
}
```

如果你只是指定了主机，但是没有指定端口，那么我们会使用默认端口`8080`。例如：
```go
import (
    "github.com/beego/beego/v2/server/web"
)

func main() {
	// now you start the beego as http server.
	// it will listen to port 8080
	web.Run("localhost")
}
```

## 相关内容
[Web Controller如何写？](controller.md)
[如何注册路由？](router/README.md)