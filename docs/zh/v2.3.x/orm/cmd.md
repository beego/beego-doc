---
title: 命令行工具
lang: zh
---

# 命令行工具

[注册模型](./model.md)与[数据库](./db.md)以后，调用`RunCommand`执行 orm 命令。

```go
func main() {
	// 需要注册模型
    // 注册数据库
    // 尤其不要忘了匿名引入驱动
	orm.RunCommand()
}
```

```bash
go build main.go
./main orm
# 直接执行可以显示帮助
# 如果你的程序可以支持的话，直接运行 go run main.go orm 也是一样的效果
```

## 自动建表

```bash
./main orm syncdb -h
Usage of orm command: syncdb:
  -db="default": DataBase alias name
  -force=false: drop tables before create
  -v=false: verbose info
```

使用 `-force=1` 可以`drop table`后再建表

使用 `-v` 可以查看执行的 `sql` 语句

---

在程序中直接调用自动建表：

```go
// 数据库别名
name := "default"

// drop table 后再建表
force := true

// 打印执行过程
verbose := true

// 遇到错误立即返回
err := orm.RunSyncdb(name, force, verbose)
if err != nil {
	fmt.Println(err)
}
```

自动建表功能在非 force 模式下，是会自动创建新增加的字段的。也会创建新增加的索引。

对于改动过的旧字段，旧索引，需要用户自行进行处理。

> 我们收到有一些 issue，提及希望我们能够支持删除字段，或者修改字段的定义。目前来说，我们并不考虑支持这一类的功能。
> 这主要是从风险角度考虑。和增加字段比起来，删除这种操作要危险得多，并且难以恢复。所以我们并不是很愿意暴露这种功能。

## 打印建表 SQL

```bash
./main orm sqlall -h
Usage of orm command: syncdb:
  -db="default": DataBase alias name
```

默认使用别名为 default 的数据库。
