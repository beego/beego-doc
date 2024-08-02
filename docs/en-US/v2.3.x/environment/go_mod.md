---
title: Go Mod
lang: en-US
sidebar: auto
---

`Beego` strongly relies on the `go mod` command, here we briefly introduce the following `go mod` commands for everyday use.

Details can be found by typing：

```shell
go help mod
```

### go mod tidy

This command will add missing dependencies or remove unused dependencies. In general, we recommend executing this command after creating a project, or after adding a new dependency.
