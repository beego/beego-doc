---
title: ORM CRUD
lang: zh
---

# ORM CRUD

A simple `Orm` instance can be created as follows：

```go
var o orm.Ormer
o = orm.NewOrm() // create Ormer
// NewOrm will execute orm.BootStrap once which will verify the models' definitions.
```

In most cases, you should try to reuse `Orm` instances, as they are designed to be stateless, with one database corresponding to one `Orm` instance


But when using transactions, we return instances of `TxOrm`, which is itself stateful, with one transaction corresponding to one instance of `TxOrm`. When using `TxOrm`, any derived queries are within that transaction.

## Insert And InsertWithCtx

API:

```go
Insert(md interface{}) (int64, error)
InsertWithCtx(ctx context.Context, md interface{}) (int64, error)
```

Example:

```go
user := new(User)
id, err = Ormer.Insert(user)
```

You should use the pointer as input.

## InsertOrUpdate And InsertOrUpdateWithCtx

API:

```go
InsertOrUpdate(md interface{}, colConflitAndArgs ...string) (int64, error)
InsertOrUpdateWithCtx(ctx context.Context, md interface{}, colConflitAndArgs ...string) (int64, error)
```

These two methods have different effects under different dialects:

- For MySQL, it means `ON DUPLICATE KEY`. So you don't need to pass the `colConflictAndArgs`;
- For PostgreSQL and sqlite, it means `ON CONFLICT cols DO UPDATE SET`, so you can specify the columns by passing `colConflictAndArgs`;
- For other dialects, you need to confirm if they have similar features;

## InsertMulti And InsertMultiWithCtx

Insert multiple objects in one api.

Like sql statement:

```sql
insert into table (name, age) values("slene", 28),("astaxie", 30),("unknown", 20)
```

The 1st param is the number of records to insert in one bulk statement. The 2nd param is models slice.

The return value is the number of successfully inserted rows.

```go
users := []User{
	{Name: "slene"},
	{Name: "astaxie"},
	{Name: "unknown"},
	...
}
successNums, err := o.InsertMulti(100, users)
```

## Update And UpdateWithCtx

Beego uses the primary key to generate the WHERE clause by default.

API:

```go
Update(md interface{}, cols ...string) (int64, error)
UpdateWithCtx(ctx context.Context, md interface{}, cols ...string) (int64, error)
```

All columns will be updated if you do not specify columns.

The first return value is the number of affected rows.

## Delete And DeleteWithCtx

Beego uses the primary key to generate the WHERE clause:

```go
Delete(md interface{}, cols ...string) (int64, error)
DeleteWithCtx(ctx context.Context, md interface{}, cols ...string) (int64, error)
```

The first return value is the number of affected rows.

## Read And ReadWithCtx

API:

```go
Read(md interface{}, cols ...string) error
ReadWithCtx(ctx context.Context, md interface{}, cols ...string) error
```

Notice:

- The returned rows will be used to initiate `md`;
- It only fetches the columns specified by `cols`;

Example:

```go
// Read all columns
u = &User{Id: user.Id}
err = Ormer.Read(u)

// Read column `UserName` only
u = &User{}
err = Ormer.Read(u, "UserName")
```

## ReadForUpdate And ReadForUpdateWithCtx

API:

```go
ReadForUpdate(md interface{}, cols ...string) error
ReadForUpdateWithCtx(ctx context.Context, md interface{}, cols ...string) error
```

They are similar to `Read` and `ReadWithCtx`. The difference is that these two methods add FOR UPDATE to the query and are therefore commonly used within transactions

However, not all databases support the FOR UPDATE statement, so you should first make sure your database supports the FOR UPDATE usage when you use it.

## ReadOrCreate And ReadOrCreateWithCtx

API:

```go
ReadOrCreate(md interface{}, col1 string, cols ...string) (bool, int64, error)
ReadOrCreateWithCtx(ctx context.Context, md interface{}, col1 string, cols ...string) (bool, int64, error)
```

Find data from the database, and if it does not exist, then insert.

Note that the "find-judge-insert" action is not atomic or thread-safe. Therefore, in a concurrent environment, it may behave in a way that exceeds your expectations. For example, if two goroutines determine that data does not exist, they will both try to insert.

## Raw And RawWithContext

```go
	Raw(query string, args ...interface{}) RawSeter
	RawWithCtx(ctx context.Context, query string, args ...interface{}) RawSeter
```

Beego does not support all SQL syntax features, so in some special cases, you need to use raw queries.

They return `RawSeter`, and more details refer [RawSeter](./raw_seter.md)。

## LoadRelated And LoadRelatedWithCtx

API:

```go
LoadRelated(md interface{}, name string, args ...utils.KV) (int64, error)
LoadRelatedWithCtx(ctx context.Context, md interface{}, name string, args ...utils.KV) (int64, error)
```

`LoadRelatedWithCtx` was deprecated.

These two methods are used to load data from related tables, such as:

```go
o.LoadRelated(post,"Tags")
for _,tag := range post.Tags{
    // your business code
}
```

Notice that the last parameter of both methods is passed in the KV values, which are currently defined inside the `hints` package, with:

- `hints.DefaultRelDepth`: Set the resolution depth of the associated table to the default value of 2；
- `hints.RelDepth`
- `hints.Limit`
- `hints.Offset`
- `hints.OrderBy`

This method should be used with caution, especially if the offset or depth is set to a large value, the response time will be longer.

## QueryM2M And QueryM2MWithCtx

API:

```go
	QueryM2M(md interface{}, name string) QueryM2Mer
	QueryM2MWithCtx(ctx context.Context, md interface{}, name string) QueryM2Mer
```

`QueryM2MWithCtx` was deprecated, as the `ctx` parameter has no effect.

More details refer [QueryM2Mer](./query_m2m.md#)
