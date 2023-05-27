---
title: Quickly Start
lang: en-US
---

# Quickly Start

First make sure you have GO installed, version 1.16 or higher, and that you have set the GOPATH environment variable and added GOPATH/bin to the environment variable.

> We recommend that you simply use the latest stable version, as we try to stay on top of the latest version of Go.

Or you can refer:

[Windows installation](environment/install_go_windows.md)

[Linux installation](environment/install_go_linux.md)

[Mac installation](environment/install_go_mac.md)

**Please note that after `Beego` V2 we require the `go mod` feature, make sure that the `go mod` feature is turned on, i.e. `GO111MODULE=on`**. More details refer to [Go module](environment/go_mod.md)

Or you can specify the GOPROXY:

```shell
GOPROXY=https://goproxy.cn
```

Next, let's try to start a `hello world` example. In this example, we will use the `Bee` tool to create the `hello world` project.

More details refer to [Bee](./bee/README.md)

## Steps

If you already have a development environment installed, then you may consider using our quick install script.

### Mac or Linux

Run:

```shell
bash <(curl -s https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```

Or using wget:

```shell
bash <(wget -qO- https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```

### Windows

Using `curl`：

```shell
bash <(curl -s https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.bat)
```

Or `wget`

```shell
bash <(wget -qO- https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.bat)
```

## Manual Installation

In this section, we will use the `go get` command, so if you are not familiar with it, we suggest that you read [Go get](environment/go_get_command.md)

Always remember, if you experience network problems, or timeout issues, make sure you set up the `GOPROXY` proxy.

### Install Bee

Run:

```shell
go get -u github.com/beego/bee/v2@latest
```

And then

```shell
bee version
```

you can see:

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

### Create Project

Run:

```shell
bee new hello
cd hello
go mod tidy
```

And then:

```shell
bee run
```
you can see:

```shell
2021/03/31 23:29:19 SUCCESS  ▶ 0004 Built Successfully!
2021/03/31 23:29:19 INFO     ▶ 0005 Restarting 'hello'...
2021/03/31 23:29:19 SUCCESS  ▶ 0006 './hello' is running...
2021/03/31 23:29:22.016 [I] [parser.go:413]  generate router from comments

2021/03/31 23:29:22.016 [I] [server.go:241]  http server Running on http://:8080
```
