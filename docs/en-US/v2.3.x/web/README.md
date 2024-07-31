---
title: Web 模块
lang: en-US
sidebar: auto
---

# Web 模块

Here we are all enabled in programming mode, i.e. there will be no dependency on configuration files. Please refer to the module's [configuration description and configuration examples](./config.md) for almost all parameters that use configuration files.

## Quickly Start

Building a web server is as simple as writing the following in the code:

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

In this case, the web server will use port `8080`, so please make sure that port is not occupied before starting.

[Web examples](https://github.com/beego/beego-example/blob/master/httpserver/basic/main.go)

## Basic Usage

### Port

If you wish to specify the port of the server, then you can pass in the port at startup time:

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

### Host And Port

We generally do not recommend this writing style as it does not seem necessary, i.e:

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

If you just specify the host, but not the port, then we will use the default port `8080`. For example:

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

## Reference

[Register routers](./router/README.md)
