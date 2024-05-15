---
title: Register database
lang: en-US
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

Example:

```go
// args[0]        Alias of the database, used to switch the database in ORM
// args[1]        driverName
// args[2]        DSN
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8")

// args[3](optional)  max number of idle connections
// args[4](optional)  max number of connections (go >= 1.2)
maxIdle := 30
maxConn := 30
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxIdleConnections(maxIdle), orm.MaxOpenConnections(maxConn))
```

ORM requires a `default` database to be registered. And Beego's ORM does not manage connections itself, but relies directly on the driver.

## Configuration

### Max number of connections

There are two ways to set the maximum number of connections, one way is to use the `MaxOpenConnections` option when registering the database:

```go
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxOpenConnections(100))
```

It can also be modified after registration:

```go
orm.SetMaxOpenConns("default", 30)
```

### Max number of idle connections

There are two ways to set the maximum number of idle connections, one way is to use the `MaxIdleConnections` option when registering the database:
```go
orm.RegisterDataBase("default", "mysql", "root:root@/orm_test?charset=utf8", orm.MaxIdleConnections(20))
```

### Time zone 

ORM uses `time.Local` as default time zone, and you can modify it by:

```go
// 设置为 UTC 时间
orm.DefaultTimeLoc = time.UTC
```

ORM will get the time zone used by the database while doing `RegisterDataBase`, and then do the corresponding conversion when accessing the `time.Time` type to match the time system, so as to ensure that the time will not be wrong.

**Notice:**

- Given the design of Sqlite3, accesses default to UTC time
- When using the go-sql-driver driver, please pay attention to the configuration
  From a certain version, the driver uses UTC time by default instead of local time, so please specify the time zone parameter or access it all in UTC time:
  For example `root:root@/orm_test?charset=utf8&loc=Asia%2FShanghai`
  More details refer [loc](https://github.com/go-sql-driver/mysql#loc) / [parseTime](https://github.com/go-sql-driver/mysql#parsetime)

## Driver

Most of the time, you only need to use the default ones for drivers that have:

```go
	DRMySQL                      // mysql
	DRSqlite                     // sqlite
	DROracle                     // oracle
	DRPostgres                   // pgsql
	DRTiDB                       // TiDB
```

If you need to register a custom driver, you can use.

```go
// args[0]   driverName
// args[1]   driver implementation
// mysql / sqlite3 / postgres / tidb were registered automatically
orm.RegisterDriver("mysql", yourDriver)
```
