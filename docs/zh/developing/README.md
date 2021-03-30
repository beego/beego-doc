---
title: 快速开始
lang: zh
---
# 快速开始

首先确保自己已经安装了 GO，版本在 1.14 之上，同时设置了 GOPATH环境变量，并且将 GOPATH/bin 加入到了环境变量。

如果你还没安装环境，请参考：

[Windows 安装](install_go_windows.md)
[Linux 安装](install_go_linux.md)
[Mac 安装](install_go_mac.md)

**请注意，在`Beego` V2 之后，我们要求使用`go mod`特性，请务必确保开启了`go mod`特性，即设置了`GO111MODULE=on`。

更多信息请参考[Go module](go_mod.md)

## Mac or Linux

那么可以在控制台直接执行以下语句：

```shell
bash <(curl -s https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```
如果没有安装`curl`，那么可以使用`wget`，执行：

```shell
bash <(wget -qO- https://raw.githubusercontent.com/beego/beego-doc/main/scripts/quickstart.sh)
```

## Windows


