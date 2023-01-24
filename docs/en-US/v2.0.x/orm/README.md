---
title: 快速开始
lang: en-US
---

# Orm

[ORM examples](https://github.com/beego/beego-example/tree/master/orm)

Beego's ORM is designed as two:

- Normal `Orm` instances: These instances are stateless, so you should keep a database with only one instance if possible. Of course, even if you create a new instance every time, it's not a big deal, it's just not necessary;
- `TxOrm`: This is the `Orm` object obtained after starting a transaction, it can only be used within the transaction, and will be discarded after commit or rollback, and cannot be reused. A new instance needs to be created for each transaction.

## Quickly Start

Exmaple:

```go
import (
	"github.com/beego/beego/v2/client/orm"
	// don't forget this
	_ "github.com/go-sql-driver/mysql"
)

// User -
type User struct {
	ID   int    `orm:"column(id)"`
	Name string `orm:"column(name)"`
}

func init() {
	// need to register models in init
	orm.RegisterModel(new(User))

	// need to register default database
	orm.RegisterDataBase("default", "mysql", "root:123456@tcp(127.0.0.1:3306)/beego?charset=utf8")
}

func main() {
	// automatically build table
	orm.RunSyncdb("default", false, true)

	// create orm object
	o := orm.NewOrm()

	// data
	user := new(User)
	user.Name = "mike"

	// insert data
	o.Insert(user)
}

```

In general, it can be divided into the following steps:

- Define and register models, refer [model](./model.md)
- Register databases, refer [database](./db.md)
- Create `Orm` instances
- Execute queries, Beego provides query API, refer:
  - [Orm CRUD](orm.md)
  - [QueryBuilder](./query_builder.md)
  - [QuerySeter](./query_seter.md)
  - [RawSeter](./raw_seter.md)
  - [QueryM2Mer](./query_m2m.md)

It is important to note that you must introduce the driver anonymously according to the database you are using. i.e. `"github.com/go-sql-driver/mysql"`

## Debug log

In the development environment, you can output the SQL:

```go
func main() {
	orm.Debug = true
```

When turned on, all query statements will be output, including execution, preparation, transactions, etc. Note that this option should not be turned on in production environments, as outputting logs can seriously impact performance.
