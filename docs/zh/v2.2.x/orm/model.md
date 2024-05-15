---
title: 模型定义与注册
lang: zh
---

# ORM 模型

Beego 的 ORM 模块要求在使用之前要先注册好模型，并且 Beego 会执行一定的校验，用于辅助检查模型和模型之间的约束。并且模型定义也会影响自动建表功能[自动建表](./cmd.md)

Beego 的模型定义，大部分都是依赖于 Go 标签特性，可以设置多个特性，用`;`分隔。同一个特性的不同值使用`,`来分隔。

例如：

```go
orm:"null;rel(fk)"
```

## 注册模型

注册模型有三个方法：

- `RegisterModel(models ...interface{})`
- `RegisterModelWithPrefix(prefix string, models ...interface{})`：该方法会为表名加上前缀，例如`RegisterModelWithPrefix("tab_", &User{})`，那么表名是`tab_user`；
- `RegisterModelWithSuffix(suffix string, models ...interface{})`：该方法会为表名加上后缀，例如`RegisterModelWithSuffix("_tab", &User{})`，那么表名是`user_tab`

## 模型基本设置

### 表名

默认的表名规则，使用驼峰转蛇形：

```
AuthUser -> auth_user
Auth_User -> auth__user
DB_AuthUser -> d_b__auth_user
```

除了开头的大写字母以外，遇到大写会增加 `_`，原名称中的下划线保留。

也可以自定义表名，只需要实现接口`TableNameI`:

```go
type User struct {
	Id int
	Name string
}

func (u *User) TableName() string {
	return "auth_user"
}
```

同时，也可以在注册模型的时候为表名加上前缀或者后缀，参考**注册模型**一节。

### 列

为字段设置 DB 列的名称

```go
Name string `orm:"column(user_name)"`
```

### 忽略字段

设置 `-` 即可忽略模型中的字段

```go
type User struct {
  // ...
	AnyField string `orm:"-"`
  //...
}
```

### 索引

默认情况下，可以在字段定义里面使用 Go 的标签功能指定索引，包括指定唯一索引。

例如，为单个字段增加索引：

```go
Name string `orm:"index"`
```

或者，为单个字段增加 unique 键

```go
Name string `orm:"unique"`
```

实现接口`TableIndexI`，可以为单个或多个字段增加索引：

```go
type User struct {
	Id    int
	Name  string
	Email string
}

// 多字段索引
func (u *User) TableIndex() [][]string {
	return [][]string{
		[]string{"Id", "Name"},
	}
}

// 多字段唯一键
func (u *User) TableUnique() [][]string {
	return [][]string{
		[]string{"Name", "Email"},
	}
}
```

### 主键

可以用`auto`显示指定一个字段为自增主键，该字段必须是 int, int32, int64, uint, uint32, 或者 uint64。

```go
MyId int32 `orm:"auto"`
```

如果一个模型没有定义主键，那么 符合上述类型且名称为 `Id` 的模型字段将被视为自增主键。

如果不想使用自增主键，那么可以使用`pk`设置为主键。

```go
Name string `orm:"pk"`
```

> 注意，目前 Beego 的非自增主键和联合主键支持得不是特别好。建议普遍使用自增主键

鉴于 go 目前的设计，即使使用了 uint64，但你也不能存储到他的最大值。依然会作为 int64 处理。

参见 issue [6113](http://code.google.com/p/go/issues/detail?id=6113)

### 默认值

默认值是一个扩展功能，必须要显示注册默认值的`Filter`，而后在模型定义里面加上`default`的设置。

```go

import (
"github.com/beego/beego/v2/client/orm/filter/bean"
"github.com/beego/beego/v2/client/orm"
)

type DefaultValueTestEntity struct {
Id            int
Age           int `default:"12"`
AgeInOldStyle int `orm:"default(13);bee()"`
AgeIgnore     int
}

func XXX() {
    builder := bean.NewDefaultValueFilterChainBuilder(nil, true, true)
    orm.AddGlobalFilterChain(builder.FilterChain)
    o := orm.NewOrm()
    _, _ = o.Insert(&User{
        ID: 1,
        Name: "Tom",
    })
}
```

### 自动更新时间

```go
Created time.Time `orm:"auto_now_add;type(datetime)"`
Updated time.Time `orm:"auto_now;type(datetime)"`
```

- auto_now 每次 model 保存时都会对时间自动更新
- auto_now_add 第一次保存时才设置时间

对于批量的 update 此设置是不生效的

### 引擎

仅支持 MySQL，只需要实现接口`TableEngineI`。

默认使用的引擎，为当前数据库的默认引擎，这个是由你的 mysql 配置参数决定的。

你可以在模型里设置 TableEngine 函数，指定使用的引擎

```go
type User struct {
	Id    int
	Name  string
	Email string
}

// 设置引擎为 INNODB
func (u *User) TableEngine() string {
	return "INNODB"
}
```

## 模型高级设置

### null

数据库表默认为 `NOT NULL`，设置 null 代表 `ALLOW NULL`

```go
Name string `orm:"null"`
```

### size

string 类型字段默认为 varchar(255)

设置 size 以后，db type 将使用 varchar(size)

```go
Title string `orm:"size(60)"`
```

### digits / decimals

设置 float32, float64 类型的浮点精度

```go
Money float64 `orm:"digits(12);decimals(4)"`
```

总长度 12 小数点后 4 位 eg: `99999999.9999`

### type

设置为 date 时，time.Time 字段的对应 db 类型使用 date

```go
Created time.Time `orm:"auto_now_add;type(date)"`
```

设置为 datetime 时，time.Time 字段的对应 db 类型使用 datetime

```go
Created time.Time `orm:"auto_now_add;type(datetime)"`
```

### Precision

为`datetime`字段设置精度值位数，不同 DB 支持最大精度值位数也不一致。

```go
type User struct {
	...
	Created time.Time `orm:"type(datetime);precision(4)"`
	...
}
```

### Comment

为字段添加注释

```go
type User struct {
	...
	Status int `orm:"default(1);description(这是状态字段)"`
	...
}
```

注意: 注释中禁止包含引号

## 模型字段与数据库类型的映射

在此列出 ORM 推荐的对应数据库类型，自动建表功能也会以此为标准。

默认所有的字段都是 **NOT NULL**

##z## MySQL

| go                                          | mysql                           |
| :------------------------------------------ | :------------------------------ |
| int, int32 - 设置 auto 或者名称为 `Id` 时   | integer AUTO_INCREMENT          |
| int64 - 设置 auto 或者名称为 `Id` 时        | bigint AUTO_INCREMENT           |
| uint, uint32 - 设置 auto 或者名称为 `Id` 时 | integer unsigned AUTO_INCREMENT |
| uint64 - 设置 auto 或者名称为 `Id` 时       | bigint unsigned AUTO_INCREMENT  |
| bool                                        | bool                            |
| string - 默认为 size 255                    | varchar(size)                   |
| string - 设置 type(char) 时                 | char(size)                      |
| string - 设置 type(text) 时                 | longtext                        |
| time.Time - 设置 type 为 date 时            | date                            |
| time.Time                                   | datetime                        |
| byte                                        | tinyint unsigned                |
| rune                                        | integer                         |
| int                                         | integer                         |
| int8                                        | tinyint                         |
| int16                                       | smallint                        |
| int32                                       | integer                         |
| int64                                       | bigint                          |
| uint                                        | integer unsigned                |
| uint8                                       | tinyint unsigned                |
| uint16                                      | smallint unsigned               |
| uint32                                      | integer unsigned                |
| uint64                                      | bigint unsigned                 |
| float32                                     | double precision                |
| float64                                     | double precision                |
| float64 - 设置 digits, decimals 时          | numeric(digits, decimals)       |

### Sqlite3

| go                                                                     | sqlite3               |
| :--------------------------------------------------------------------- | :-------------------- |
| int, int32, int64, uint, uint32, uint64 - 设置 auto 或者名称为 `Id` 时 | integer AUTOINCREMENT |
| bool                                                                   | bool                  |
| string - 默认为 size 255                                               | varchar(size)         |
| string - 设置 type(char) 时                                            | character(size)       |
| string - 设置 type(text) 时                                            | text                  |
| time.Time - 设置 type 为 date 时                                       | date                  |
| time.Time                                                              | datetime              |
| byte                                                                   | tinyint unsigned      |
| rune                                                                   | integer               |
| int                                                                    | integer               |
| int8                                                                   | tinyint               |
| int16                                                                  | smallint              |
| int32                                                                  | integer               |
| int64                                                                  | bigint                |
| uint                                                                   | integer unsigned      |
| uint8                                                                  | tinyint unsigned      |
| uint16                                                                 | smallint unsigned     |
| uint32                                                                 | integer unsigned      |
| uint64                                                                 | bigint unsigned       |
| float32                                                                | real                  |
| float64                                                                | real                  |
| float64 - 设置 digits, decimals 时                                     | decimal               |

### PostgreSQL

| go                                                                     | postgres                                             |
| :--------------------------------------------------------------------- | :--------------------------------------------------- |
| int, int32, int64, uint, uint32, uint64 - 设置 auto 或者名称为 `Id` 时 | serial                                               |
| bool                                                                   | bool                                                 |
| string - 若没有指定 size 默认为 text                                   | varchar(size)                                        |
| string - 设置 type(char) 时                                            | char(size)                                           |
| string - 设置 type(text) 时                                            | text                                                 |
| string - 设置 type(json) 时                                            | json                                                 |
| string - 设置 type(jsonb) 时                                           | jsonb                                                |
| time.Time - 设置 type 为 date 时                                       | date                                                 |
| time.Time                                                              | timestamp with time zone                             |
| byte                                                                   | smallint CHECK("column" >= 0 AND "column" <= 255)    |
| rune                                                                   | integer                                              |
| int                                                                    | integer                                              |
| int8                                                                   | smallint CHECK("column" >= -127 AND "column" <= 128) |
| int16                                                                  | smallint                                             |
| int32                                                                  | integer                                              |
| int64                                                                  | bigint                                               |
| uint                                                                   | bigint CHECK("column" >= 0)                          |
| uint8                                                                  | smallint CHECK("column" >= 0 AND "column" <= 255)    |
| uint16                                                                 | integer CHECK("column" >= 0)                         |
| uint32                                                                 | bigint CHECK("column" >= 0)                          |
| uint64                                                                 | bigint CHECK("column" >= 0)                          |
| float32                                                                | double precision                                     |
| float64                                                                | double precision                                     |
| float64 - 设置 digits, decimals 时                                     | numeric(digits, decimals)                            |

## 表关系设置

### rel / reverse

**RelOneToOne**:

```go
type User struct {
	...
	Profile *Profile `orm:"null;rel(one);on_delete(set_null)"`
	...
}
```

对应的反向关系 **RelReverseOne**:

```go
type Profile struct {
	...
	User *User `orm:"reverse(one)"`
	...
}
```

**RelForeignKey**:

```go
type Post struct {
	...
	User *User `orm:"rel(fk)"` // RelForeignKey relation
	...
}
```

对应的反向关系 **RelReverseMany**:

```go
type User struct {
	...
	Posts []*Post `orm:"reverse(many)"` // fk 的反向关系
	...
}
```

**RelManyToMany**:

```go
type Post struct {
	...
	Tags []*Tag `orm:"rel(m2m)"` // ManyToMany relation
	...
}
```

对应的反向关系 **RelReverseMany**:

```go
type Tag struct {
	...
	Posts []*Post `orm:"reverse(many)"`
	...
}
```

### rel_table / rel_through

此设置针对 `orm:"rel(m2m)"` 的关系字段

- `rel_table`: 设置自动生成的 m2m 关系表的名称
- `rel_through`: 如果要在 m2m 关系中使用自定义的 m2m 关系表，通过这个设置其名称，格式为 `pkg.path.ModelName`，例如: `app.models.PostTagRel`，`PostTagRel` 表需要有到 `Post` 和 `Tag` 的关系

当设置 `rel_table` 时会忽略 `rel_through`

设置方法：

`orm:"rel(m2m);rel_table(the_table_name)"`

`orm:"rel(m2m);rel_through(pkg.path.ModelName)"`

### on_delete

设置对应的 rel 关系删除时，如何处理关系字段。

- `cascade`: 级联删除(默认值)
- `set_null`: 设置为 NULL，需要设置 null = true
- `set_default`: 设置为默认值，需要设置 default 值
- `do_nothing`: 什么也不做，忽略

```go
type User struct {
	...
	Profile *Profile `orm:"null;rel(one);on_delete(set_null)"`
	...
}
type Profile struct {
	...
	User *User `orm:"reverse(one)"`
	...
}

// 删除 Profile 时将设置 User.Profile 的数据库字段为 NULL
```

#### 例子

```go
type User struct {
    Id int
    Name string
}

type Post struct {
    Id int
    Title string
    User *User `orm:"rel(fk)"`
}
```

假设 `Post -> User` 是 `ManyToOne` 的关系，也就是外键。

```go
o.Filter("Id", 1).Delete()
```

这个时候即会删除 `Id` 为 1 的 `User` 也会删除其发布的 `Post`

不想删除的话，需要设置 `set_null`

```go
type Post struct {
    Id int
    Title string
    User *User `orm:"rel(fk);null;on_delete(set_null)"`
}
```

那这个时候，删除 `User` 只会把对应的 `Post.user_id` 设置为 `NULL`

当然有时候为了高性能的需要，多存点数据无所谓啊，造成批量删除才是问题。

```go
type Post struct {
    Id int
    Title string
    User *User `orm:"rel(fk);null;on_delete(do_nothing)"`
}
```

那么只要删除的时候，不操作 Post 就可以了。
