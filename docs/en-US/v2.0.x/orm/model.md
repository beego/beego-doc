---
title: Model
lang: zh
---

# ORM Model

Beego's ORM module requires that the model be registered before it can be used, and Beego performs certain checks to assist in checking the model and the constraints between the models。The definition of models has impact on [creating table automatically](./cmd.md)

Beego's model definition, which mostly relies on Go tag features, can set multiple features, separated by `;`. Different values of the same feature are separated by `,`。

Example:

```go
orm:"null;rel(fk)"
```

## Register

There are three ways to register a model:

- `RegisterModel(models ...interface{})`
- `RegisterModelWithPrefix(prefix string, models ...interface{})`: This method prefixes the table name with，i.e. `RegisterModelWithPrefix("tab_", &User{})` => `tab_user`；
- `RegisterModelWithSuffix(suffix string, models ...interface{})`: This method adds a suffix to the table name, i.e.`RegisterModelWithSuffix("_tab", &User{})` => `user_tab`

## Basic Usage

### Table Name

Beego ORM will use the snake case as the table name:

```
AuthUser -> auth_user
Auth_User -> auth__user
DB_AuthUser -> d_b__auth_user
```

Or you can specify the table name by implementing interface `TableNameI`:

```go
type User struct {
	Id int
	Name string
}

func (u *User) TableName() string {
	return "auth_user"
}
```

Also, you can add a prefix or suffix to the table name when registering the model. More details refer to the section **Registering the Model**。

### Column

Using tag to specify the column name:

```go
Name string `orm:"column(user_name)"`
```

### Ignore Fields

Using tag "-" to ignore some fields:

```go
type User struct {
  // ...
	AnyField string `orm:"-"`
  //...
}
```

### Index

Similarly, you can use tag to specify indexes, including unique index.

For example, specify the index for the field:

```go
Name string `orm:"index"`
```

Or specify the field as unique index:

```go
Name string `orm:"unique"`
```

Or implement the interface `TableIndexI`: 

```go
type User struct {
	Id    int
	Name  string
	Email string
}

// index with multiple columns
func (u *User) TableIndex() [][]string {
	return [][]string{
		[]string{"Id", "Name"},
	}
}

// unique index with columns
func (u *User) TableUnique() [][]string {
	return [][]string{
		[]string{"Name", "Email"},
	}
}
```

### Primary Key

You can specify a field as a auto-incrementing primary key using the `auto` tag，and the type of the specific fields must be int, int32, int64, uint, uint32, or uint64。

```go
MyId int32 `orm:"auto"`
```

If a model does not have a primary key defined, then a field of the above type with the name `Id` will be treated as a auto-incrementing primary key。

If you don't want to use a auto-incrementing primary key, then you can use `pk` tag to specify the primary key。

```go
Name string `orm:"pk"`
```

> Note that Beego's non-auto-incrementing primary keys and union primary keys are not particularly well supported now. It is recommended to use self-incrementing primary keys in general

Given go's current design, even though uint64 is used, you can't store it to its maximum value. It will still be treated as int64。 More details refer issue [6113](http://code.google.com/p/go/issues/detail?id=6113)

### Default Value

you could use it like:

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

`NewDefaultValueFilterChainBuilder`will create an instance of `DefaultValueFilterChainBuilder`
In beego v1.x, the default value config looks like `orm:default(xxxx)`
But the default value in 2.x is `default:xxx`, so if you want to be compatible with v1.x, please pass true as `compatibleWithOldStyle`

### auto_now / auto_now_add

```go
Created time.Time `orm:"auto_now_add;type(datetime)"`
Updated time.Time `orm:"auto_now;type(datetime)"`
```

* auto_now: every save will update time.
* auto_now_add: set time at the first save

This setting won't affect massive `update`.

### engine

Only supports MySQL database

The default engine is the default engine of the current database engine of your mysql settings.

Using `TableEngineI` interface:

```go
type User struct {
    Id    int
    Name  string
    Email string
}

// Set engine to INNODB
func (u *User) TableEngine() string {
    return "INNODB"
}
```

## Advance Usage

### null

Fields are `NOT NULL` by default. Set null to `ALLOW NULL`.

```go
Name string `orm:"null"`
```

### size

Default value for string field is varchar(255).

It will use varchar(size) after setting.

```go
Title string `orm:"size(60)"`
```
### digits / decimals

Set precision for float32 or float64.

```go
Money float64 `orm:"digits(12);decimals(4)"`
```

Total 12 digits, 4 digits after point. For example: `12345678.1234`

### type

If set type as date, the field's db type is date.

```go
Created time.Time `orm:"auto_now_add;type(date)"`
```

If set type as datetime, the field's db type is datetime.

```go
Created time.Time `orm:"auto_now_add;type(datetime)"`
```

### Time Precision

```go
type User struct {
	...
	Created time.Time `orm:"type(datetime);precision(4)"`
	...
}
```

### Comment

```go
type User struct {
	...
	Status int `orm:"default(1);description(this is status)"`
	...
}
```

You should never use quoter as the value of description.

## Types Mapping

Model fields mapping with database type

Here is the recommended database type mapping. It's also the standard for table generation.

All the fields are **NOT NULL** by default.

### MySQL

| go		   |mysql
| :---   	   | :---
| int, int32 - set as auto or name is `Id` | integer AUTO_INCREMENT
| int64 - set as auto or name is`Id` | bigint AUTO_INCREMENT
| uint, uint32 - set as auto or name is `Id` | integer unsigned AUTO_INCREMENT
| uint64 - set as auto or name is `Id` | bigint unsigned AUTO_INCREMENT
| bool | bool
| string - default size 255 | varchar(size)
| string - set type(char) | char(size)
| string - set type(text) | longtext
| time.Time - set type as date | date
| time.Time | datetime
| byte | tinyint unsigned
| rune | integer
| int | integer
| int8 | tinyint
| int16 | smallint
| int32 | integer
| int64 | bigint
| uint | integer unsigned
| uint8 | tinyint unsigned
| uint16 | smallint unsigned
| uint32 | integer unsigned
| uint64 | bigint unsigned
| float32 | double precision
| float64 | double precision
| float64 - set digits and decimals  | numeric(digits, decimals)

### Sqlite3

| go		   | sqlite3
| :---   	   | :---
| int, int32, int64, uint, uint32, uint64 - set as auto or name is `Id` | integer AUTOINCREMENT
| bool | bool
| string - default size 255 | varchar(size)
| string - set type(char) | character(size)
| string - set type(text) | text
| time.Time - set type as date | date
| time.Time | datetime
| byte | tinyint unsigned
| rune | integer
| int | integer
| int8 | tinyint
| int16 | smallint
| int32 | integer
| int64 | bigint
| uint | integer unsigned
| uint8 | tinyint unsigned
| uint16 | smallint unsigned
| uint32 | integer unsigned
| uint64 | bigint unsigned
| float32 | real
| float64 | real
| float64 - set digits and decimals | decimal

### PostgreSQL

| go		   | postgres
| :---   	   | :---
| int, int32, int64, uint, uint32, uint64 - set as auto or name is `Id` | serial
| bool | bool
| string - if not set size default text | varchar(size)
| string - set type(char) | char(size)
| string - set type(text) | text
| string - set type(json) | json
| string - set type(jsonb) | jsonb
| time.Time - set type as date | date
| time.Time | timestamp with time zone
| byte | smallint CHECK("column" >= 0 AND "column" <= 255)
| rune | integer
| int | integer
| int8 | smallint CHECK("column" >= -127 AND "column" <= 128)
| int16 | smallint
| int32 | integer
| int64 | bigint
| uint | bigint CHECK("column" >= 0)
| uint8 | smallint CHECK("column" >= 0 AND "column" <= 255)
| uint16 | integer CHECK("column" >= 0)
| uint32 | bigint CHECK("column" >= 0)
| uint64 | bigint CHECK("column" >= 0)
| float32 | double precision
| float64 | double precision
| float64 - set digits and decimals  | numeric(digits, decimals)

## Relationships

### rel / reverse

**RelOneToOne**:

```go
type User struct {
	...
	Profile *Profile `orm:"null;rel(one);on_delete(set_null)"`
	...
}
```

The reverse relationship **RelReverseOne**:

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

The reverse relationship **RelReverseMany**:

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

The reverse relationship **RelReverseMany**:

```go
type Tag struct {
	...
	Posts []*Post `orm:"reverse(many)"`
	...
}
```

### rel_table / rel_through

This setting is for `orm:"rel(m2m)"` field:

	rel_table       Set the auto-generated m2m connecting table name
	rel_through     If you want to use custom m2m connecting table, set name by using this setting.
                  Format: `project_path/current_package.ModelName`
                  For example: `app/models.PostTagRel` PostTagRel table needs to have a relationship to Post table and Tag table.


If rel_table is set, rel_through is ignored.

You can set these as follows:

`orm:"rel(m2m);rel_table(the_table_name)"`

`orm:"rel(m2m);rel_through(project_path/current_package.ModelName)"`

### on_delete

Set how to deal with field if related relationship is deleted:

	cascade        cascade delete (default)
	set_null       set to NULL. Need to set null = true
	set_default    set to default value. Need to set default value.
	do_nothing     do nothing. ignore.

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

// Set User.Profile to NULL while deleting Profile
```

#### Exmaple 

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

Assume Post -> User is ManyToOne relationship by foreign key.

```
o.Filter("Id", 1).Delete()
```

This will delete User with Id 1 and all his Posts.

If you don't want to delete the Posts, you need to set `set_null`

```go
type Post struct {
    Id int
    Title string
    User *User `orm:"rel(fk);null;on_delete(set_null)"`
}
```

In this case, only set related Post.user_id to NULL while deleting.

Usually for performance purposes, it doesn't matter to have redundant data. The massive deletion is the real problem

```go
type Post struct {
    Id int
    Title string
    User *User `orm:"rel(fk);null;on_delete(do_nothing)"`
}
```

So just don't change Post (ignore it) while deleting User.
