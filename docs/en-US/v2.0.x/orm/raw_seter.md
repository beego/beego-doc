---
title: 原生查询
lang: en-US
---

# 原生查询

Most of the time, you should not use raw queries. Raw queries should only be considered when there is no other choice.

* Using Raw SQL to query doesn't require an ORM definition
* Multiple databases support `?` as placeholders and auto convert.
* The params of query support Model Struct, Slice and Array

Example:

```go
o := orm.NewOrm()
ids := []int{1, 2, 3}
var r RawSter
r = o.Raw("SELECT name FROM user WHERE id IN (?, ?, ?)", ids)
```

## Exec

Run sql query and return [sql.Result](http://gowalker.org/database/sql#Result) object

```go
res, err := o.Raw("UPDATE user SET name = ?", "your").Exec()
if err == nil {
num, _ := res.RowsAffected()
fmt.Println("mysql row affected nums: ", num)
}
```

## QueryRow And QueryRows

API:

```go
QueryRow(containers ...interface{}) error
QueryRows(containers ...interface{}) (int64, error)
```

They will use the returned values to initiate `container`。

Example:

```go
var name string
var id int
// id==2 name=="slene"
dORM.Raw("SELECT 'id','name' FROM `user`").QueryRow(&id,&name)
```

In this example, `QueryRow` will query to get two columns and only one row. In this case, the values of the two columns are assigned to `id` and `name` respectively.

QueryRows Example:

```go
var ids []int
var names []int
query = "SELECT 'id','name' FROM `user`"
// ids=>{1,2},names=>{"nobody","slene"}
num, err = dORM.Raw(query).QueryRows(&ids,&names)
```

Similarly, `QueryRows` is also returned by column, so you can notice that in the example we have declared two slices corresponding to the columns `id` and `name` respectively。

## SetArgs

Changing args param in Raw(sql, args...) can return a new RawSeter:

```go
SetArgs(...interface{}) RawSeter
```

Example:

```go
var name string
var id int
query := "SELECT 'id','name' FROM `user` WHERE `id`=?"
// id==2 name=="slene"
// 等效于"SELECT 'id','name' FROM `user` WHERE `id`=1"
dORM.Raw(query).SetArgs(1).QueryRow(&id,&name)
```

It can also be used in a single sql statement, reused, replacing parameters and then executed.

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

More details refer：

- [Values](./query_seter.md#values)
- [ValuesList](./query_seter.md#valueslist)
- [ValuesFlat](./query_seter.md#valuesflat)

## RowsToMap

```go
RowsToMap(result *Params, keyCol, valueCol string) (int64, error)
```

SQL query results

| name | value |
| --- | --- |
| total | 100 |
| found | 200 |

map rows results to map

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

SQL query results

| name | value |
| --- | --- |
| total | 100 |
| found | 200 |

map rows results to struct

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

> support name conversion: snake -> camel, eg: SELECT user_name ... to your struct field UserName.

## Prepare

Prepare once and exec multiple times to improve the speed of batch execution.

```go
p, err := o.Raw("UPDATE user SET name = ? WHERE name = ?").Prepare()
res, err := p.Exec("testing", "slene")
res, err  = p.Exec("testing", "astaxie")
...
...
p.Close() // Don't forget to close the prepare statement.
```
