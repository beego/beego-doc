---
title: 配置模块
lang: zh
---

# 配置模块

配置模块是基础模块之一，对不同类型的配置文件提供了一种抽象。该章节内容都可以在[配置模块例子](https://github.com/beego/beego-example/tree/master/config)

Beego 目前支持 INI、XML、JSON、YAML 格式的配置文件解析，也支持以 `etcd` 作为远程配置中心。默认采用了 INI 格式解析，用户可以通过简单的配置就可以获得很大的灵活性。

它们拥有的方法都是一样的，具体可以参考[Config API](https://github.com/beego/beego/blob/develop/core/config/config.go)。主要方法有：

```go
// Configer defines how to get and set value from configuration raw data.
type Configer interface {
	// support section::key type in given key when using ini type.
	Set(key, val string) error

	// support section::key type in key string when using ini and json type; Int,Int64,Bool,Float,DIY are same.
	String(key string) (string, error)
	// get string slice
	Strings(key string) ([]string, error)
	Int(key string) (int, error)
	Int64(key string) (int64, error)
	Bool(key string) (bool, error)
	Float(key string) (float64, error)
	// support section::key type in key string when using ini and json type; Int,Int64,Bool,Float,DIY are same.
	DefaultString(key string, defaultVal string) string
	// get string slice
	DefaultStrings(key string, defaultVal []string) []string
	DefaultInt(key string, defaultVal int) int
	DefaultInt64(key string, defaultVal int64) int64
	DefaultBool(key string, defaultVal bool) bool
	DefaultFloat(key string, defaultVal float64) float64

	// DIY return the original value
	DIY(key string) (interface{}, error)

	GetSection(section string) (map[string]string, error)

	Unmarshaler(prefix string, obj interface{}, opt ...DecodeOption) error
	Sub(key string) (Configer, error)
	OnChange(key string, fn func(value string))
	SaveConfigFile(filename string) error
}
```

这里有一些使用的注意事项：

1. 所有的`Default*`方法，在`key`不存在，或者查找的过程中，出现`error`，都会返回默认值；
2. `DIY`直接返回对应的值，而没有做任何类型的转换。当你使用这个方法的时候，你应该自己确认值的类型。只有在极少数的情况下你才应该考虑使用这个方法；
3. `GetSection`会返回`section`所对应的部分配置。`section`如何被解释，取决于具体的实现；
4. `Unmarshaler`会尝试用当且配置的值来初始化`obj`。需要注意的是，`prefix`的概念类似于`section`；
5. `Sub`类似与`GetSection`，都是尝试返回配置的一部分。所不同的是，`GetSection`将结果组织成`map`，而`Sub`将结果组织成`Config`实例；
6. `OnChange`主要用于监听配置的变化。对于大部分依赖于文件系统的实现来说，都不支持。具体而言，我们设计这个主要是为了考虑支持远程配置；
7. `SaveConfigFile`尝试将配置导出成为一个文件；
8. 某些实现支持分段式的`key`。比如说`a.b.c`这种，但是，并不是所有的实现都支持，也不是所有的实现都采用`.`作为分隔符。这是一个历史遗留问题，为了保留兼容性，我们无法在这方面保持一致。

Web 模块封装了配置模块，可以参考[Web 配置](./../web/config.md)

## 初始化方法

大致上有两种用法：
- 使用`config.XXXX`：这是依赖于全局配置实例
- 使用`Configer`实例
- 
### 全局实例

Beego 默认会解析当前应用下的 `conf/app.conf` 文件，后面就可以通过`config`包名直接使用：
```go
import (
	"github.com/beego/beego/v2/core/config"
	"github.com/beego/beego/v2/core/logs"
)

func main() {
	val, _ := config.String("name")
	logs.Info("auto load config name is", val)
}
```

也可以手动初始化全局实例，以指定不同的配置类型，例如说启用`etcd`：
```go
config.InitGlobalInstance("etcd", "etcd address")
```

### 使用`Configer`实例

如果要从多个源头读取配置，或者说自己不想依赖于全局配置，那么可以自己初始化一个配置实例：
```go
func main() {
	cfg, err := config.NewConfig("ini", "my_config.ini")
	if err != nil {
		logs.Error(err)
	}
	val, _ := cfg.String("appname")
	logs.Info("auto load config name is", val)
}
```

## 环境变量支持

配置文件解析支持从环境变量中获取配置项，配置项格式：`${环境变量}`。例如下面的配置中优先使用环境变量中配置的 runmode 和 httpport，如果有配置环境变量 ProRunMode 则优先使用该环境变量值。如果不存在或者为空，则使用 "dev" 作为 runmode。例如使用 INI 的时候指定环境变量：

```ini
	runmode  = "${ProRunMode||dev}"
	httpport = "${ProPort||9090}"
```

## 支持的配置

注意，所以的相对文件路径，都是从你的工作目录开始计算！
其次，除了默认的 INI 格式，其余格式都需要采用匿名引入的方式引入对应的包。

### INI 格式

INI 是配置模块的默认格式。同时它支持使用`include`的方式，加载多个配置文件。

app.ini:
```ini
	appname = beepkg
	httpaddr = "127.0.0.1"
	httpport = 9090

	include "app2.ini"
```

app2.ini:
```ini
	runmode ="dev"
	autorender = false
	recoverpanic = false
	viewspath = "myview"

	[dev]
	httpport = 8080
	[prod]
	httpport = 8088
	[test]
	httpport = 8888
```
```go
func main() {
	cfg, err := config.NewConfig("ini", "app.ini")
	if err != nil {
		logs.Error(err)
	}
	val, _ := cfg.String("appname")
	logs.Info("auto load config name is", val)
}
```
### JSON

JSON 只需要指定格式，并且不要忘了使用匿名引入的方式引入 JSON 的实现：
```go
import (
	"github.com/beego/beego/v2/core/config"
	// 千万不要忘了
	_ "github.com/beego/beego/v2/core/config/json"
	"github.com/beego/beego/v2/core/logs"
)

var (
	ConfigFile = "./app.json"
)

func main() {
	err := config.InitGlobalInstance("json", ConfigFile)
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := config.String("name")

	logs.Info("load config name is", val)
}
```
### YAML

别忘了匿名引入 YAML 的实现！

```go
import (
	"github.com/beego/beego/v2/core/config"
	// never forget this
	_ "github.com/beego/beego/v2/core/config/yaml"
	"github.com/beego/beego/v2/core/logs"
)

var (
	ConfigFile = "./app.yaml"
)

func main() {
	err := config.InitGlobalInstance("yaml", ConfigFile)
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := config.String("name")

	logs.Info("load config name is", val)
}
```
### XML

别忘了匿名引入 XML 的实现！
```go
import (
	"github.com/beego/beego/v2/core/config"
	// never forget this
	_ "github.com/beego/beego/v2/core/config/xml"
	"github.com/beego/beego/v2/core/logs"
)

var (
	ConfigFile = "./app.xml"
)

func main() {
	err := config.InitGlobalInstance("xml", ConfigFile)
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := config.String("name")

	logs.Info("load config name is", val)
}
```

要注意，所有的配置项都要放在`config`这个顶级节点之内：
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<config>
    <name>beego</name>
</config>
```

### TOML
别忘了匿名引入 TOML 的实现！

```go
import (
	"github.com/beego/beego/v2/core/config"
	// never forget this
	_ "github.com/beego/beego/v2/core/config/toml"
	"github.com/beego/beego/v2/core/logs"
)

var (
	ConfigFile = "./app.toml"
)

func main() {
	err := config.InitGlobalInstance("toml", ConfigFile)
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := config.String("name")

	logs.Info("load config name is", val)
}
```

### Etcd
别忘了匿名引入 ETCD 的实现！
```go
import (
	"github.com/beego/beego/v2/core/config"
	// never forget this
	_ "github.com/beego/beego/v2/core/config/toml"
	"github.com/beego/beego/v2/core/logs"
)

func main() {
	err := config.InitGlobalInstance("etcd", "your_config")
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := config.String("name")

	logs.Info("load config name is", val)
}
```
其中 `your_config` 是一个 JSON 配置，它对应于：
```go
type Config struct {
	// Endpoints is a list of URLs.
	Endpoints []string `json:"endpoints"`

	// AutoSyncInterval is the interval to update endpoints with its latest members.
	// 0 disables auto-sync. By default auto-sync is disabled.
	AutoSyncInterval time.Duration `json:"auto-sync-interval"`

	// DialTimeout is the timeout for failing to establish a connection.
	DialTimeout time.Duration `json:"dial-timeout"`

	// DialKeepAliveTime is the time after which client pings the server to see if
	// transport is alive.
	DialKeepAliveTime time.Duration `json:"dial-keep-alive-time"`

	// DialKeepAliveTimeout is the time that the client waits for a response for the
	// keep-alive probe. If the response is not received in this time, the connection is closed.
	DialKeepAliveTimeout time.Duration `json:"dial-keep-alive-timeout"`

	// MaxCallSendMsgSize is the client-side request send limit in bytes.
	// If 0, it defaults to 2.0 MiB (2 * 1024 * 1024).
	// Make sure that "MaxCallSendMsgSize" < server-side default send/recv limit.
	// ("--max-request-bytes" flag to etcd or "embed.Config.MaxRequestBytes").
	MaxCallSendMsgSize int

	// MaxCallRecvMsgSize is the client-side response receive limit.
	// If 0, it defaults to "math.MaxInt32", because range response can
	// easily exceed request send limits.
	// Make sure that "MaxCallRecvMsgSize" >= server-side default send/recv limit.
	// ("--max-request-bytes" flag to etcd or "embed.Config.MaxRequestBytes").
	MaxCallRecvMsgSize int

	// TLS holds the client secure credentials, if any.
	TLS *tls.Config

	// Username is a user name for authentication.
	Username string `json:"username"`

	// Password is a password for authentication.
	Password string `json:"password"`

	// RejectOldCluster when set will refuse to create a client against an outdated cluster.
	RejectOldCluster bool `json:"reject-old-cluster"`

	// DialOptions is a list of dial options for the grpc client (e.g., for interceptors).
	// For example, pass "grpc.WithBlock()" to block until the underlying connection is up.
	// Without this, Dial returns immediately and connecting the server happens in background.
	DialOptions []grpc.DialOption

	// Context is the default client context; it can be used to cancel grpc dial out and
	// other operations that do not have an explicit context.
	Context context.Context

	// Logger sets client-side logger.
	// If nil, fallback to building LogConfig.
	Logger *zap.Logger

	// LogConfig configures client-side logger.
	// If nil, use the default logger.
	// TODO: configure gRPC logger
	LogConfig *zap.Config

	// PermitWithoutStream when set will allow client to send keepalive pings to server without any active streams(RPCs).
	PermitWithoutStream bool `json:"permit-without-stream"`

	// TODO: support custom balancer picker
}
```


