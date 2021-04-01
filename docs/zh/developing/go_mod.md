---
title: Go Get 命令指南
lang: zh
---

`Beego`强依赖于`go mod`命令，这里我们简单介绍以下日常用的`go mod`命令。

详细信息可以在命令行输入：
```shell
go help mod
```

### go mod tidy

会添加缺失的依赖，或者移除未被使用的依赖。一般来说，我们建议在创建项目之后，或者在添加了新的依赖以后，执行该命令。