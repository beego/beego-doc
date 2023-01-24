---
title: ORM tool
lang: zh
---

# ORM tool

After registering [model](. /model.md) and [database](./db.md), call the `RunCommand` method to execute the ORM command。

```go
func main() {
	// ...registering models
    // ...registering database
    // don't forget import the driver
	orm.RunCommand()
}
```

```bash
go build main.go
./main orm
```

## Creating table automatically

```bash
./main orm syncdb -h
Usage of orm command: syncdb:
  -db="default": DataBase alias name
  -force=false: drop tables before create
  -v=false: verbose info
```
Beego will execute `drop table` before creating tables if you specify the flag `-force=1`.

And then use `-v` to check the SQL.

```go
name := "default"

// drop tables
force := true

// print SQL
verbose := true

err := orm.RunSyncdb(name, force, verbose)
if err != nil {
	fmt.Println(err)
}
```
If you do not use the `-force=1` flag, Beego will create new columns or create new indexes.

But if you wish to update the existing columns or indexes, you need to update them manually.

> We have received some feedback mentioning that we would like to support deleting fields, or modifying the definition of a field. For now, we are not considering supporting this type of functionality.
> This is mainly from a risk perspective. Compared to adding fields, deleting such operations is much more dangerous and difficult to recover. So we are not very willing to expose this kind of functionality.

## Print SQL

```bash
./main orm sqlall -h
Usage of orm command: syncdb:
  -db="default": DataBase alias name
```
