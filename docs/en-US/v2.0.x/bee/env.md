---
name: Bee Environment Variable
lang: zh
---

## Configure Bee on Mac or Linux

`bee` relies on Go development environment, so you must install the Go development environment. If you do not install the Go, please install it.

- Go download: https://go.dev or https://golang.org

After completing the installation, make sure that you can use the `go`
 command in your terminal, or you have to put the installation directory into the PATH environment variable.

Here is the example of changing the PATH variable which works for Linux and Mac:
- If you use `bash`, check the file `~/.bashrc` or `~/.bash_profile`
- If you use `Zsh`, check the file `~/.zshrc`
- For Linux, you may need to check file `/etc/profile`

Also, you can run the command `echo $SHELL` to output the shell installed on your computer.

```bash
# go installation directory
export GOROOT=/usr/local/go
# GOPATH in general you don't need to change it.
# it's the directory that you want to store the Go projects.
export GOPATH=/Users/ding/go_workspace
# GOBIN in general you don't need to change it
# when you run the command `go install`, the specific tool will be added here
export GOBIN=$GOPATH/bin
# Currently you don't need to use this unless you are using the Go <= v1.14
export GO111MODULE=on
# GO proxy which will download the dependencies from this website.
# Sometimes your company has its own proxy, you can change this
export GOPROXY=https://goproxy.cn,direct
# Don't forget this
export PATH=$PATH:$GOROOT/bin:$GOBIN
```

Add this into the shell configure file and then reload the configure file(or open a new terminal)

## Configure Bee on Windows

> TODO: missing English pictures


![golang_env](./img/env1.png)
![golang_env](./img/env2.png)
![golang_env](./img/env3.png)

## bee installation

Run the command to install `bee`：

`go get github.com/beego/bee/v2@latest`

And then run the command `bee version`：

![bee_test](./img/bee_test.png)

This indicates installing the `bee` successfully.