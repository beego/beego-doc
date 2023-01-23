---
title: 快速开始
lang: zh
---

# 快速开始

首先确保自己已经安装了 GO，版本在 1.16 之上，同时设置了 GOPATH 环境变量，并且将 GOPATH/bin 加入到了环境变量。

> 我们建议你直接使用最新的稳定版本，因为我们会尽量保持使用最新版本的 Go 版本。

如果你还没安装环境，请参考：

[Windows 安装](environment/install_go_windows.md)

[Linux 安装](environment/install_go_linux.md)

[Mac 安装](environment/install_go_mac.md)

**请注意，在`Beego` V2 之后，我们要求使用`go mod`特性，请务必确保开启了`go mod`特性，即设置了`GO111MODULE=on`**。

更多信息请参考[Go module](environment/go_mod.md)

同时，如果你是在中国大陆境内，我们建议你同时设置`GORPOXY`。在自己的环境变量里面设置：

```shell
GOPROXY=https://goproxy.cn
```

接下来，我们来尝试启动一个`hello world`的例子。在这个例子里面，我们将使用`Bee`工具来创建`hello world`项目。

更多信息参考[Bee](./bee/README.md)

## 快速开始

如果你已经安装好了开发环境，那么你可以考虑使用我们的快速安装脚本。

### Mac or Linux

在控制台直接执行以下语句：

```shell
bash <(curl -s https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```

如果没有安装`curl`，那么可以使用`wget`，执行：

```shell
bash <(wget -qO- https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```

如果你无法使用这两个命令，那么可以尝试直接下载这两个文件，而后执行。

### Windows

使用`curl`：

```shell
bash <(curl -s https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.bat)
```

如果你没有安装`curl`命令，可以使用`wget`命令：

```shell
bash <(wget -qO- https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.bat)
```

如果你无法通过命令下载脚本，可以尝试自己下载脚本而后执行。

## 手动安装

在这一章节，我们会使用到`go get`命令，如果你还不熟悉它，我们建议你可以先阅读[Go get](environment/go_get_command.md)

千万记住，如果你遇到了网络问题，或者超时问题，请务必确保自己设定了`GOPROXY`代理。

### 安装 Bee

我们来看一下手动如何安装`Bee`。在命令行里面执行：

```shell
go get -u github.com/beego/bee/v2@master
```

而后运行

```shell
bee version
```

你将看到类似输出：

```shell
| ___ \
| |_/ /  ___   ___
| ___ \ / _ \ / _ \
| |_/ /|  __/|  __/
\____/  \___| \___| v2.0.x

├── Beego     : Beego is not installed. Please do consider installing it first: https://github.com/beego/beego/v2. If you are using go mod, and you don't install the beego under $GOPATH/src/github.com/beego, just ignore this.
├── GoVersion : go1.16
├── GOOS      : linux
├── GOARCH    : amd64
├── NumCPU    : 12
├── GOPATH    : /home/xxx/go
├── GOROOT    : /home/aaa/bbb/go
├── Compiler  : gc
└── Published : 2020-12-16

```

### 创建项目

执行：

```shell
bee new hello
```

这会在当前目录下创建一个名叫`hello`的文件夹。

而后进入文件夹：

```shell
cd hello
```

而后我们执行[go mod tidy](environment/go_mod.md)命令，来生成`go.sum`文件。

```shell
go mod tidy
```

而后，我们尝试启动：

```shell
bee run
```

如果没有错误的话，你会看到类似的输出：

```shell
2021/03/31 23:29:19 SUCCESS  ▶ 0004 Built Successfully!
2021/03/31 23:29:19 INFO     ▶ 0005 Restarting 'hello'...
2021/03/31 23:29:19 SUCCESS  ▶ 0006 './hello' is running...
2021/03/31 23:29:22.016 [I] [parser.go:413]  generate router from comments

2021/03/31 23:29:22.016 [I] [server.go:241]  http server Running on http://:8080
```

如果你启动不成功，请先确认自己的 `8080` 端口是否被占用了。
