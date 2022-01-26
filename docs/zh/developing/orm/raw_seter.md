---
title: 原生查询
lang: zh
---

# 原生查询

大多数时候，你都不应该使用原生查询。只有在无可奈何的情况下才应该考虑原生查询。使用原生查询可以：

* 无需使用 ORM 表定义
* 多数据库，都可直接使用占位符号 `?`，自动转换
* 查询时的参数，支持使用 Model Struct 和 Slice, Array

例如：
```go
o := orm.NewOrm()
ids := []int{1, 2, 3}
var r RawSter
r = o.Raw("SELECT name FROM user WHERE id IN (?, ?, ?)", ids)
```
这里得到一个`RawSeter`的实例，它包含极多的方法。

## Exec

执行 sql 语句，返回 [sql.Result](http://gowalker.org/database/sql#Result) 对象。

```go
res, err := o.Raw("UPDATE user SET name = ?", "your").Exec()
if err == nil {
	num, _ := res.RowsAffected()
	fmt.Println("mysql row affected nums: ", num)
}
```
一般来说，使用该方法的应该是非 SELECT 语句。

## QueryRow 和 QueryRows

这两个方法的定义是：
```go
QueryRow(containers ...interface{}) error
QueryRows(containers ...interface{}) (int64, error)
```
这两个方法会把返回的数据赋值给`container`。

例如：
```go
var name string
var id int
// id==2 name=="slene"
dORM.Raw("SELECT 'id','name' FROM `user`").QueryRow(&id,&name) 
```
在这个例子里面，`QueryRow`会查询得到两列，并且只有一行。在这种情况下，两列的值分别被赋值给`id`和`name`。

使用`QueryRows`的例子：
```go
var ids []int
var names []int
query = "SELECT 'id','name' FROM `user`"
// ids=>{1,2},names=>{"nobody","slene"}
num, err = dORM.Raw(query).QueryRows(&ids,&names) 
```
同样地，`QueryRows`也是按照列来返回，因此可以注意到在例子里面我们声明了两个切片，分别对应于`id`和`name`两个列。

## SetArgs

该方法用于设置参数。注意的是，参数个数必须和占位符`?`的数量保持一致。其定义：
```go
SetArgs(...interface{}) RawSeter
```
例如：
```go
var name string
var id int
query := "SELECT 'id','name' FROM `user` WHERE `id`=?"
// id==2 name=="slene"
// 等效于"SELECT 'id','name' FROM `user` WHERE `id`=1"
dORM.Raw(query).SetArgs(1).QueryRow(&id,&name) 
```

也可以用于单条 sql 语句，重复利用，替换参数然后执行。

```go
res, err := r.SetArgs("arg1", "arg2").Exec()
res, err := r.SetArgs("arg1", "arg2").Exec()

```

## Values / ValuesList / ValuesFlat
```go
	Values(container *[]Params, cols ...string) (int64, error)
	ValuesList(container *[]ParamsList, cols ...string) (int64, error)
	ValuesFlat(container *ParamsList, cols ...string) (int64, error)
```
参考`QuerySeter`中的：
- [Values](./query_seter.md#values)
- [ValuesList](./query_seter.md#valueslist)
- [ValuesFlat](./query_seter.md#valuesflat)

## RowsToMap

```go
RowsToMap(result *Params, keyCol, valueCol string) (int64, error)
```

SQL 查询结果是这样：

| name | value |
| --- | --- |
| total | 100 |
| found | 200 |

查询结果匹配到 map 里

```go
res := make(orm.Params)
nums, err := o.Raw("SELECT name, value FROM options_table").RowsToMap(&res, "name", "value")
// res is a map[string]interface{}{
//	"total": 100,
//	"found": 200,
// }
```

## RowsToStruct
```go
RowsToStruct(ptrStruct interface{}, keyCol, valueCol string) (int64, error)
```
SQL 查询结果是这样

| name | value |
| --- | --- |
| total | 100 |
| found | 200 |

查询结果匹配到 struct 里

```go
type Options struct {
	Total int
	Found int
}

res := new(Options)
nums, err := o.Raw("SELECT name, value FROM options_table").RowsToStruct(res, "name", "value")
fmt.Println(res.Total) // 100
fmt.Println(res.Found) // 200
```

> 匹配支持的名称转换为 snake -> camel, eg: SELECT user_name ... 需要你的 struct 中定义有 UserName

## Prepare
```go
Prepare() (RawPreparer, error)
```
用于一次 prepare 多次 exec，以提高批量执行的速度。

```go
p, err := o.Raw("UPDATE user SET name = ? WHERE name = ?").Prepare()
res, err := p.Exec("testing", "slene")
res, err  = p.Exec("testing", "astaxie")
// ...
p.Close() // 别忘记关闭 statement
```
