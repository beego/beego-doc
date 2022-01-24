---
title: ORM
lang: zh
---

# ORM

ORM 的例子在[这里](https://github.com/beego/beego-example/tree/master/orm)

Beego 的 ORM 被设计成为两种：
- 普通的 `Orm` 实例：这种实例是无状态的，因此你应该尽可能保持一个数据库只有一个实例。当然，即便每次你都创建新的实例，问题也不大，只是没有必要而已；
- `TxOrm`：这是启动事务之后得到的`Orm`对象，它只能被用于事务内，提交或者回滚之后就要丢弃，不能复用。每一个事务都需要创建一个新的实例；

## 快速开始

这是一个最简单的 ORM 例子：
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

总体来说，可以分成以下几步：
- 定义模型，并且注册，参考[模型定义](./model.md)
- 注册 DB，参考[数据库注册](./db.md)
- 创建 `Orm` 实例
- 执行查询，参考[ORM 查询](./query.md)

需要注意的是，一定要根据自己使用的数据库来匿名引入驱动，例如引入 `"github.com/go-sql-driver/mysql"` 
