---
title: Web 模块配置
lang: zh
---

# Web 模块配置

这里我们主要讨论 Web 模块各个配置项，而配置模块如何使用，可以参考[配置模块](../config/README.md)

## 文件配置

`BConfig` 是默认的 Web 配置实例。默认情况下，Beego 会解析当前应用下的 `conf/app.conf` 文件，用于初始化 `web.BConfig`。

例如:

```ini
	appname = beepkg
	httpaddr = "127.0.0.1"
	httpport = 9090
	runmode ="dev"
	autorender = false
	recoverpanic = false
	viewspath = "myview"
```

这里需要注意的是，配置项并没有使用驼峰命名，而是保持了全小写。但是不同的配置格式，也可以支持驼峰命名和下划线命名。例如 JSON 的配置格式，则只跟你结构体里面 json 标签的取值有关。

## 指定文件初始化 BConfig

如果你想指定一个文件加载，那么可以使用方法：

```go
const ConfigFile = "./my-custom.conf"
func main() {
	err := web.LoadAppConfig("ini", ConfigFile)
	if err != nil {
		logs.Critical("An error occurred:", err)
		panic(err)
	}

	val, _ := web.AppConfig.String("name")

	logs.Info("load config name is", val)
}
```

可以重复调用多次`LoadAppConfig`，如果后面的文件和前面的 key 冲突，那么以最新加载的为最新值

## 代码配置

在应用简单的时候，或者说配置项在不同环境下的值都是一样的情况下，可以考虑使用代码来配置。它的好处是能够充分享受到编译期的类型检查，当然缺点也是非常明显，即不够灵活，也无法在运行时动态修改。

Beego 中 Web 模块的配置放在结构体：

```go
type Config struct {
    // ...
}
```

例如：

```go
web.BConfig.AppName="My-App"
```

## 配置详情

详细的字段含义可以直接参考源码[Config 定义](https://github.com/beego/beego/blob/develop/server/web/config.go)

### App 配置

- AppName

  应用名称，默认是 beego。通过 `bee new` 创建的是创建的项目名。

  `web.BConfig.AppName = "beego"`

- RunMode

  应用的运行模式，可选值为 `prod`, `dev` 或者 `test`. 默认是 `dev`, 为开发模式，在开发模式下出错会提示友好的出错页面，如前面错误描述中所述。

  `web.BConfig.RunMode = "dev"`

- RouterCaseSensitive

  是否路由忽略大小写匹配，默认是 true，区分大小写

  `web.BConfig.RouterCaseSensitive = true`

- ServerName

  beego 服务器默认在请求的时候输出 server 为 beego。

  `web.BConfig.ServerName = "beego"`

- RecoverPanic

  是否异常恢复，默认值为 true，即当应用出现异常的情况，通过 recover 恢复回来，而不会导致应用异常退出。

  `web.BConfig.RecoverPanic = true`

- CopyRequestBody

  是否允许在 HTTP 请求时，返回原始请求体数据字节，默认为 false （GET or HEAD or 上传文件请求除外）。

  `web.BConfig.CopyRequestBody = false`

- EnableGzip

  是否开启 gzip 支持，默认为 false 不支持 gzip，一旦开启了 gzip，那么在模板输出的内容会进行 gzip 或者 zlib 压缩，根据用户的 Accept-Encoding 来判断。

  `web.BConfig.EnableGzip = false`

  Gzip 允许用户自定义压缩级别、压缩长度阈值和针对请求类型压缩:

  1.  压缩级别, `gzipCompressLevel = 9`,取值为 1~9,如果不设置为 1(最快压缩)

  2.  压缩长度阈值, `gzipMinLength = 256`,当原始内容长度大于此阈值时才开启压缩,默认为 20B(ngnix 默认长度)

  3.  请求类型, `includedMethods = get;post`,针对哪些请求类型进行压缩,默认只针对 GET 请求压缩

- MaxMemory

  文件上传默认内存缓存大小，默认值是 `1 << 26`(64M)。

  `web.BConfig.MaxMemory = 1 << 26`

- EnableErrorsShow

  是否显示系统错误信息，默认为 true。

  `web.BConfig.EnableErrorsShow = true`

- EnableErrorsRender

  是否将错误信息进行渲染，默认值为 true，即出错会提示友好的出错页面，对于 API 类型的应用可能需要将该选项设置为 false 以阻止在 `dev` 模式下不必要的模板渲染信息返回。

### Web 配置

- AutoRender

  是否模板自动渲染，默认值为 true，对于 API 类型的应用，应用需要把该选项设置为 false，不需要渲染模板。

  `web.BConfig.WebConfig.AutoRender = true`

- EnableDocs

  是否开启文档内置功能，默认是 false

  `web.BConfig.WebConfig.EnableDocs = true`

- FlashName

  Flash 数据设置时 Cookie 的名称，默认是 BEEGO_FLASH

  `web.BConfig.WebConfig.FlashName = "BEEGO_FLASH"`

- FlashSeperator

  Flash 数据的分隔符，默认是 BEEGOFLASH

  `web.BConfig.WebConfig.FlashSeparator = "BEEGOFLASH"`

- DirectoryIndex

  是否开启静态目录的列表显示，默认不显示目录，返回 403 错误。

  `web.BConfig.WebConfig.DirectoryIndex = false`

- StaticDir

  静态文件目录设置，默认是 static

  可配置单个或多个目录:

  1.  单个目录, `StaticDir = download`. 相当于 `beego.SetStaticPath("/download","download")`

  2.  多个目录, `StaticDir = download:down download2:down2`. 相当于 `beego.SetStaticPath("/download","down")` 和 `beego.SetStaticPath("/download2","down2")`

  `web.BConfig.WebConfig.StaticDir`

- StaticExtensionsToGzip

  允许哪些后缀名的静态文件进行 gzip 压缩，默认支持 .css 和 .js

  `web.BConfig.WebConfig.StaticExtensionsToGzip = []string{".css", ".js"}`

  等价 config 文件中

      StaticExtensionsToGzip = .css, .js

- TemplateLeft

  模板左标签，默认值是`{{`。

  `web.BConfig.WebConfig.TemplateLeft="{{"`

- TemplateRight

  模板右标签，默认值是`}}`。

  `web.BConfig.WebConfig.TemplateRight="}}"`

- ViewsPath

  模板路径，默认值是 views。

  `web.BConfig.WebConfig.ViewsPath="views"`

- EnableXSRF

  是否开启 XSRF，默认为 false，不开启。

  `web.BConfig.WebConfig.EnableXSRF = false`

- XSRFKEY

  XSRF 的 key 信息，默认值是 beegoxsrf。 EnableXSRF ＝ true 才有效

  `web.BConfig.WebConfig.XSRFKEY = "beegoxsrf"`

- XSRFExpire

  XSRF 过期时间，默认值是 0，不过期。

  `web.BConfig.WebConfig.XSRFExpire = 0`

- CommentRouterPath

  CommentRouterPath 注解路由所在位置。默认值是`controllers`。 Beego 会在启动的时候扫描下面的文件生成了路由。
  `web.BConfig.WebConfig.CommentRouterPath = "controllers"`

### 监听配置

- Graceful

  是否开启热升级，默认是 false，关闭热升级。

  `web.BConfig.Listen.Graceful=false`

- ServerTimeOut

  设置 HTTP 的超时时间，默认是 0，不超时。

  `web.BConfig.Listen.ServerTimeOut=0`

- ListenTCP4

  监听本地网络地址类型，默认是 TCP6，可以通过设置为 true 设置为 TCP4。

  `web.BConfig.Listen.ListenTCP4 = true`

- EnableHTTP

  是否启用 HTTP 监听，默认是 true。

  `web.BConfig.Listen.EnableHTTP = true`

- HTTPAddr

  应用监听地址，默认为空，监听所有的网卡 IP。

  `web.BConfig.Listen.HTTPAddr = ""`

- HTTPPort

  应用监听端口，默认为 8080。

  `web.BConfig.Listen.HTTPPort = 8080`

- EnableHTTPS

  是否启用 HTTPS，默认是 false 关闭。当需要启用时，先设置 EnableHTTPS = true，并设置 `HTTPSCertFile` 和 `HTTPSKeyFile`

  `web.BConfig.Listen.EnableHTTPS = false`

- HTTPSAddr

  应用监听地址，默认为空，监听所有的网卡 IP。

  `web.BConfig.Listen.HTTPSAddr = ""`

- HTTPSPort

  应用监听端口，默认为 10443

  `web.BConfig.Listen.HTTPSPort = 10443`

- HTTPSCertFile

  开启 HTTPS 后，ssl 证书路径，默认为空。

  `web.BConfig.Listen.HTTPSCertFile = "conf/ssl.crt"`

- HTTPSKeyFile

  开启 HTTPS 之后，SSL 证书 keyfile 的路径。

  `web.BConfig.Listen.HTTPSKeyFile = "conf/ssl.key"`

- EnableAdmin

  是否开启进程内监控模块，默认 false 关闭。

  `web.BConfig.Listen.EnableAdmin = false`

- AdminAddr

  监控程序监听的地址，默认值是 localhost 。

  `web.BConfig.Listen.AdminAddr = "localhost"`

- AdminPort

  监控程序监听的地址，默认值是 8088 。

  `web.BConfig.Listen.AdminPort = 8088`

- EnableFcgi

  是否启用 fastcgi ， 默认是 false。

  `web.BConfig.Listen.EnableFcgi = false`

- EnableStdIo

  通过 fastcgi 标准 I/O，启用 fastcgi 后才生效，默认 false。

  `web.BConfig.Listen.EnableStdIo = false`

### Session 配置

- SessionOn

  session 是否开启，默认是 false。

  `web.BConfig.WebConfig.Session.SessionOn = false`

- SessionProvider

  session 的引擎，默认是 memory，详细参见 `session 模块`。

  `web.BConfig.WebConfig.Session.SessionProvider = ""`

- SessionName

  存在客户端的 cookie 名称，默认值是 beegosessionID。

  `web.BConfig.WebConfig.Session.SessionName = "beegosessionID"`

- SessionGCMaxLifetime

  session 过期时间，默认值是 3600 秒。

  `web.BConfig.WebConfig.Session.SessionGCMaxLifetime = 3600`

- SessionProviderConfig

  配置信息，根据不同的引擎设置不同的配置信息，详细的配置请看下面的引擎设置，详细参见 [session 模块](/zh-CN/module/session.md)

- SessionCookieLifeTime

  session 默认存在客户端的 cookie 的时间，默认值是 3600 秒。

  `web.BConfig.WebConfig.Session.SessionCookieLifeTime = 3600`

- SessionAutoSetCookie

  是否开启 SetCookie, 默认值 true 开启。

  `web.BConfig.WebConfig.Session.SessionAutoSetCookie = true`

- SessionDomain

  session cookie 存储域名, 默认空。

  `web.BConfig.WebConfig.Session.SessionDomain = ""`

### Log 配置

    log详细配置，请参见 `logs 模块`。

- AccessLogs

  是否输出日志到 Log，默认在 prod 模式下不会输出日志，默认为 false 不输出日志。此参数不支持配置文件配置。

  `web.BConfig.Log.AccessLogs = false`

- FileLineNum

  是否在日志里面显示文件名和输出日志行号，默认 true。此参数不支持配置文件配置。

  `web.BConfig.Log.FileLineNum = true`

- Outputs

  日志输出配置，参考 logs 模块，console file 等配置，此参数不支持配置文件配置。

  `web.BConfig.Log.Outputs = map[string]string{"console": ""}`

  or

  `web.BConfig.Log.Outputs["console"] = ""`

## 相关内容

- [配置模块](../config/README.md)
