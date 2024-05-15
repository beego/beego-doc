---
title: Go Get Introduction
lang: en-US
sidebar: auto
---

# Get Command

## Specify Version

We generally use the `go get` command to get the dependencies. For example, in the project root directory, execute:

```shell
go get github.com/beego/beego/v2@v2.0.1
```

It will download the dependency Beego with the specific version `v2.0.1`。On `github`, this part of the code corresponds to the source code with `tag` of `v2.0.1` in `github`.

Refer [Beego tags](https://github.com/beego/beego/tags) to find out all tags.

## Latest stable version

Using `latest` to download the latest stable version：

```shell
go get github.com/beego/beego/v2@latest
```

## Using specific branch

For example, if you want to use some unstable feature, you can specify the development branch `develop`:

```shell
go get github.com/beego/beego/v2@develop
```
