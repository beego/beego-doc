---
title: Register database
lang: zh
---

# Register database

Beego ORM requires explicit registration of database information before it can be freely used。

And of course, never forget the anonymous introduction of the driver：

```go
import (
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)
```

The above three, you can introduce one according to your needs.

The simplest example:

```go
// args[0]        Alias of the database, used to switch the database in ORM
// args[1]        driverName
// args[2]        DSN
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8")

// args[3](optional)  max number of idle connections
// args[4](optional)  设置最大数据库连接 (go >= 1.2)
maxIdle := 30
maxConn := 30
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxIdleConnections(maxIdle), orm.MaxOpenConnections(maxConn))
```

ORM 要求必须要注册一个`default`的数据库。并且，Beego 的 ORM 并没有自己管理连接，而是直接依赖于驱动。

## 数据库设置

### 最大连接数

最大连接数的设置有两种方式，一种方式是在注册数据库的时候，使用`MaxOpenConnections` 选项：

```go
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxOpenConnections(100))
```

也可以在注册之后修改：

```go
orm.SetMaxOpenConns("default", 30)
```

### 最大空闲连接数

最大空闲连接数的设置有两种方式，一种方式是在注册数据库的时候，使用`MaxIdleConnections`选项：

```go
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxIdleConnections(20))
```

### 时区

ORM 默认使用 `time.Local` 本地时区

- 作用于 ORM 自动创建的时间
- 从数据库中取回的时间转换成 ORM 本地时间

如果需要的话，你也可以进行更改

```go
// 设置为 UTC 时间
orm.DefaultTimeLoc = time.UTC
```

ORM 在进行 `RegisterDataBase` 的同时，会获取数据库使用的时区，然后在 `time.Time` 类型存取时做相应转换，以匹配时间系统，从而保证时间不会出错。

**注意:**

- 鉴于 Sqlite3 的设计，存取默认都为 UTC 时间
- 使用 go-sql-driver 驱动时，请注意参数设置
  从某一版本开始，驱动默认使用 UTC 时间，而非本地时间，所以请指定时区参数或者全部以 UTC 时间存取
  例如：`root:root@/orm_test?charset=utf8&loc=Asia%2FShanghai`
  参见 [loc](https://github.com/go-sql-driver/mysql#loc) / [parseTime](https://github.com/go-sql-driver/mysql#parsetime)

## 注册驱动

大多数时候，你只需要使用默认的那些驱动，有：

```go
	DRMySQL                      // mysql
	DRSqlite                     // sqlite
	DROracle                     // oracle
	DRPostgres                   // pgsql
	DRTiDB                       // TiDB
```

如果你需要注册自定义的驱动，可以使用：

```go
// 参数1   driverName
// 参数2   数据库类型
// 这个用来设置 driverName 对应的数据库类型
// mysql / sqlite3 / postgres / tidb 这几种是默认已经注册过的，所以可以无需设置
orm.RegisterDriver("mysql", yourDriver)
```
