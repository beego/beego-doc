---
title: 日志模块
lang: zh
---

# 日志模块

这是一个用来处理日志的库，它的设计思路来自于 `database/sql`，目前支持的引擎有 file、console、net、smtp、es、slack。

例子参考[beego-example](https://github.com/beego/beego-example)下的`logs`部分

## 快速开始

首先引入包：

```go
import (
	"github.com/beego/beego/v2/core/logs"
)
```

然后添加输出引擎（log 支持同时输出到多个引擎），这里我们以 console 为例，第一个参数是引擎名：

```go
logs.SetLogger(logs.AdapterConsole)
```

添加输出引擎也支持第二个参数,用来表示配置信息，对于不同的引擎来说，其配置也是不同的。详细的配置请看下面介绍：

```go
logs.SetLogger(logs.AdapterFile,`{"filename":"project.log","level":7,"maxlines":0,"maxsize":0,"daily":true,"maxdays":10,"color":true}`)
```

然后我们就可以在我们的逻辑中开始任意的使用了：

```go
package main

import (
	"github.com/beego/beego/v2/core/logs"
)

func main() {
	//an official log.Logger
	l := logs.GetLogger()
	l.Println("this is a message of http")
	//an official log.Logger with prefix ORM
	logs.GetLogger("ORM").Println("this is a message of orm")

	logs.Debug("my book is bought in the year of ", 2016)
	logs.Info("this %s cat is %v years old", "yellow", 3)
	logs.Warn("json is a type of kv like", map[string]int{"key": 2016})
	logs.Error(1024, "is a very", "good game")
	logs.Critical("oh,crash")
}
```

### 多个实例

一般推荐使用通用方式进行日志，但依然支持单独声明来使用独立的日志

```go
package main

import (
	"github.com/beego/beego/v2/core/logs"
)

func main() {
	log := logs.NewLogger()
	log.SetLogger(logs.AdapterConsole)
	log.Debug("this is a debug message")
}
```

### 输出文件名和行号

日志默认不输出调用的文件名和文件行号,如果你期望输出调用的文件名和文件行号,可以如下设置

```go
logs.EnableFuncCallDepth(true)
```

开启传入参数 true,关闭传入参数 false,默认是关闭的.

如果你的应用自己封装了调用 log 包,那么需要设置 SetLogFuncCallDepth,默认是 2,也就是直接调用的层级,如果你封装了多层,那么需要根据自己的需求进行调整.

```go
logs.SetLogFuncCallDepth(3)
```

### 异步输出日志

为了提升性能, 可以设置异步输出:

```go
logs.Async()
```

异步输出允许设置缓冲 chan 的大小

```go
logs.Async(1e3)
```

## 自定义日志格式

在一些情况下，我们可能需要自己定义自己的日志格式规范。这种时候，可以考虑通过扩展`LogFormatter`。

```go
type LogFormatter interface {
	Format(lm *LogMsg) string
}
```

`LogMsg`包含了一条日志的所有部分。需要注意的是，如果你希望输出文件名和行号，那么应该参考**输出文件名和行号**，设置对应的参数。

### 例子：PatternLogFormatter

该实现的设计思路，是希望能够使用类似于占位符的东西来定义一条日志应该如何输出。

例子：

```go

package main

import (
	"github.com/beego/beego/v2/core/logs"
)

func main() {

	f := &logs.PatternLogFormatter{
		Pattern:    "%F:%n|%w%t>> %m",
		WhenFormat: "2006-01-02",
	}
	logs.RegisterFormatter("pattern", f)

	_ = logs.SetGlobalFormatter("pattern")

	logs.Info("hello, world")
}
```

我们先初始化了一个`PatternLogFormatter`实例，而后注册为`pattern`。

再然后我们使用`logs.SetGlobalFormatter("pattern")`设置全局所有的引擎都使用这个格式。

最终我们输出日志`/beego-example/logger/formatter/pattern/main.go:31|2020-10-29[I]>> hello, world`

如果我们只希望在某个特定的引擎上使用这个格式，我们可以通过初始化引擎的时候，设置：

```go
	_ = logs.SetLogger("console",`{"formatter": "pattern"}`)
```

`PatternLogFormatter`支持的占位符及其含义：

- 'w' 时间
- 'm' 消息
- 'f' 文件名
- 'F' 文件全路径
- 'n' 行数
- 'l' 消息级别，数字表示
- 't' 消息级别，简写，例如`[I]`代表 INFO
- 'T' 消息级别，全称

## 引擎配置设置

- console: 命令行输出，默认输出到`os.Stdout`：
  ```go
  logs.SetLogger(logs.AdapterConsole, `{"level":1,"color":true}`)
  ```
  主要的参数如下说明：
  - level 输出的日志级别
  - color 是否开启打印日志彩色打印(需环境支持彩色输出)
- file：输出到文件，设置的例子如下所示：

  ```go
  logs.SetLogger(logs.AdapterFile, `{"filename":"test.log"}`)
  ```

  主要的参数如下说明：

  - `filename` 保存的文件名
  - `maxlines` 每个文件保存的最大行数，默认值 1000000
  - `maxsize` 每个文件保存的最大尺寸，默认值是 1 << 28, 256 MB
  - `daily` 是否按照每天 `logrotate`，默认是 `true`
  - `maxdays` 文件最多保存多少天，默认保存 7 天
  - `rotate` 是否开启 `logrotate`，默认是 `true`
  - `level` 日志保存的时候的级别，默认是 `Trace` 级别
  - `perm` 日志文件权限

- multifile：不同级别的日志会输出到不同的文件中：

  设置的例子如下所示：

  ```go
  logs.SetLogger(logs.AdapterMultiFile, `{"filename":"test.log","separate":["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]}`)
  ```

  主要的参数如下说明(除 `separate` 外,均与 file 相同)：

  - `filename` 保存的文件名
  - `maxlines` 每个文件保存的最大行数，默认值 1000000
  - `maxsize` 每个文件保存的最大尺寸，默认值是 1 << 28, //256 MB
  - `daily` 是否按照每天 logrotate，默认是 true
  - `maxdays` 文件最多保存多少天，默认保存 7 天
  - `rotate` 是否开启 logrotate，默认是 true
  - `level` 日志保存的时候的级别，默认是 Trace 级别
  - `perm` 日志文件权限
  - `separate` 需要单独写入文件的日志级别,设置后命名类似 test.error.log

- conn: 网络输出，设置的例子如下所示：

  ```go
    logs.SetLogger(logs.AdapterConn, `{"net":"tcp","addr":":7020"}`)
  ```

  主要的参数说明如下：

  - reconnectOnMsg 是否每次链接都重新打开链接，默认是 false
  - reconnect 是否自动重新链接地址，默认是 false
  - net 发开网络链接的方式，可以使用 tcp、unix、udp 等
  - addr 网络链接的地址
  - level 日志保存的时候的级别，默认是 Trace 级别

- smtp: 邮件发送，设置的例子如下所示：

  ```go
  logs.SetLogger(logs.AdapterMail, `{"username":"beegotest@gmail.com","password":"xxxxxxxx","host":"smtp.gmail.com:587","sendTos":["xiemengjun@gmail.com"]}`)
  ```

  主要的参数说明如下：

  - `username`: `smtp` 验证的用户名
  - `password`: `smtp` 验证密码
  - `host`: 发送的邮箱地址
  - `sendTos`: 邮件需要发送的人，支持多个
  - `subject`: 发送邮件的标题，默认是 `Diagnostic message from server`
  - `level`: 日志发送的级别，默认是 Trace 级别

- ElasticSearch：输出到 ElasticSearch:

  ```go
  logs.SetLogger(logs.AdapterEs, `{"dsn":"http://localhost:9200/","level":1}`)
  ```

- 简聊: 输出到简聊：

  ```go
  logs.SetLogger(logs.AdapterJianLiao, `{"authorname":"xxx","title":"beego", "webhookurl":"https://jianliao.com/xxx", "redirecturl":"https://jianliao.com/xxx","imageurl":"https://jianliao.com/xxx","level":1}`)
  ```

- slack: 输出到 slack
  ```go
  logs.SetLogger(logs.AdapterSlack, `{"webhookurl":"https://slack.com/xxx","level":1}`)
  ```
