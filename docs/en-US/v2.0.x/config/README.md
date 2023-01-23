---
title: Configure Module
lang: zh
---

# Configure Module
Configure module is the core module which provides an abstraction layer for different configuration sources or formats. 

You can find the [examples here](https://github.com/beego/beego-example/tree/master/config)

Currently, Beego support all major configure formats, including **INI(by default)**, XML, JSON, YAML and remote configure center `etcd`.

[Config API](https://github.com/beego/beego/blob/develop/core/config/config.go)：

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

Notices：

1. All `Default*` methods will return the default value if the key is not exist or got any error;
2. `DIY` returns the value directly without any conversion；
3. `GetSection` returns all configuration of the specific `section`, and it depends on the implementation details；
4. `Unmarshaler` tries to use the configuration value to initiate the `obj`。`prefix` is similar to `section`；
5. `Sub` is similar to `GetSection` which tries to return all configuration of the specific `section`。The difference is that `GetSection` returns the values as `map` but `Sub` returns the values as `Config` instance；
6. `OnChange` subscribes the change the configuration. But most of the implementations which is based on file system do not support this methods. In general we prefer to use this for configure center like etcd；
7. `SaveConfigFile` writes all configuration into file(s)；
8. Some implementations support the key like `a.b.c` while some DO NOT. Besides, some implementations choose the `.` as separator while some choose other characters. This is a historical problem and we can not make them consistent if we keep backward compatible。

Web module re-encapsulate the configuration module, more details refer [Web Module Configuration](./../web/config.md)

## Initiate

There are two major ways to use the configuration module:

- Uses package functions `config.XXXX` which relies on the global instance
- Initiates `Configer` instances


### Global instance

Beego will try to parse the file `conf/app.conf` so that you can use the package functions：

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

Or you can initiate the global instance manually to specify the source:

```go
config.InitGlobalInstance("etcd", "etcd address")
```

### Initiates `Configer` instances

If you do not want to use the global instance, you can initiate the `Configer` instances manually:

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

## Environment variable

The format for this is `${ENVIRONMENTVARIABLE}` within the configuration file which is equivalent to `value = os.Getenv('ENVIRONMENTVARIABLE')`. Beego will only check for environment variables if the value begins with `${` and ends with `}`.

Additionally, a default value can be configured for the case that there is no environment variable set or the environment variable is empty. This is accomplished by using the format `${ENVVAR||defaultvalue}`:

```ini
	runmode  = "${ProRunMode||dev}"
	httpport = "${ProPort||9090}"
```

## Implementations


Note that all relative file paths, are calculated from your working directory!
Second, except for the default INI implementation, all other implementations need to be introduced using anonymous introduction of the corresponding package.

### INI

INI is the default implementation for configuring modules. It also supports loading multiple configuration files using the `include` syntax。

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

```go
import (
	"github.com/beego/beego/v2/core/config"
	// DO NOT FORGET THIS
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

Note that all configuration items should be placed within the root `config`：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<config>
    <name>beego</name>
</config>
```

### TOML

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

where `your_config` is a JSON configuration that corresponds to：

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
