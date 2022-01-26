---
title: Orm 增删改查
lang: zh
---

# Orm 增删改查

如下就可以创建一个简单的`Orm`实例：

```go
var o orm.Ormer
o = orm.NewOrm() // 创建一个 Ormer
// NewOrm 的同时会执行 orm.BootStrap (整个 app 只执行一次)，用以验证模型之间的定义并缓存。
```

大多数情况下，你应该尽量复用`Orm` 实例，因为本身`Orm`实例被设计为无状态的，一个数据库对应一个`Orm`实例。

但是在使用事务的时候，我们会返回`TxOrm`的实例，它本身是有状态的，一个事务对应一个`TxOrm`实例。在使用`TxOrm`时候，任何衍生查询都是在该事务内。

## Insert 和 InsertWithCtx
定义：
```go
Insert(md interface{}) (int64, error)
InsertWithCtx(ctx context.Context, md interface{}) (int64, error)
```
例如：
```go
user := new(User)
id, err = Ormer.Insert(user)
```

这两个方法都只接收指针做为参数。

## InsertOrUpdate 和 InsertOrUpdateWithCtx
定义：
```go
InsertOrUpdate(md interface{}, colConflitAndArgs ...string) (int64, error)
InsertOrUpdateWithCtx(ctx context.Context, md interface{}, colConflitAndArgs ...string) (int64, error)
```
这两个方法在不同的方言之下有不同的效果：
- 对于 MySQL 来说，是执行 `ON DUPLICATE KEY`。因此最后一个参数`colConflictAndArgs` 不需要传；
- 对于 PostgreSQL 来说，是执行 `ON CONFLICT cols DO UPDATE SET`，因此最后一个参数`colConflictAndArgs`可以传入具体的列名；
- 对于别的方言来说，你需要确认它们支持类似的语法；

## InsertMulti 和 InsertMultiWithCtx

用于执行批量插入：
```go
InsertMulti(bulk int, mds interface{}) (int64, error)
InsertMultiWithCtx(ctx context.Context, bulk int, mds interface{}) (int64, error)
```
参数`bulk`是每一次批量插入的时候插入的数量。例如`bulk<=1`代表每一批插入一条数据，而如果`bulk=3`代表每次插入三条数据。你需要仔细选择批次大小，它对插入性能有很大影响。大多数情况下，你可以把`bulk`设置成数据量大小。

`mds`必须是一个数组，或者是一个切片。

第一个返回值表示最终插入了多少数据。

## Update 和 UpdateWithCtx

使用主键来更新数据。也就是如果你使用这个方法，Beego 会尝试读取里面的主键值，而后将主键作为更新的条件。

定义是：
```go
Update(md interface{}, cols ...string) (int64, error)
UpdateWithCtx(ctx context.Context, md interface{}, cols ...string) (int64, error)
```

如果你没有指定 `cols` 参数，那么所有的列都会被更新。

第一个返回值是受影响的行数。

## Delete 和 DeleteWithCtx

使用主键来删除数据，定义：
```go
Delete(md interface{}, cols ...string) (int64, error)
DeleteWithCtx(ctx context.Context, md interface{}, cols ...string) (int64, error)
```
第一个返回值是受影响的行数。

## Read 和 ReadWithCtx
方法定义为：
```go
Read(md interface{}, cols ...string) error
ReadWithCtx(ctx context.Context, md interface{}, cols ...string) error
```
该方法的特点是：
- 读取到的数据会被放到 `md`；
- 如果传入了 `cols` 参数，那么只会选取特定的列；

例如：
```go
// 读取全部列
u = &User{Id: user.Id}
err = Ormer.Read(u)

// 只读取用户名这一个列
u = &User{}
err = Ormer.Read(u, "UserName")
```

## ReadForUpdate 和 ReadForUpdateWithCtx

这两个方法的定义是：
```go
ReadForUpdate(md interface{}, cols ...string) error
ReadForUpdateWithCtx(ctx context.Context, md interface{}, cols ...string) error
```

这两个方法类似于`Read`和`ReadWithCtx`，所不同的是，这两个方法在查询的时候加上 FOR UPDATE，因此常用于事务内部。

但是并不是所有的数据库都支持 FOR UPDATE 语句，所以你在使用的时候要首先确认自己的数据库支持 FOR UPDATE 的用法。

## ReadOrCreate 和 ReadOrCreateWithCtx
它们的定义是：
```go
ReadOrCreate(md interface{}, col1 string, cols ...string) (bool, int64, error)
ReadOrCreateWithCtx(ctx context.Context, md interface{}, col1 string, cols ...string) (bool, int64, error)
```
从数据库中查找数据，如果数据不存在，那么就插入。

需要注意的是，“查找-判断-插入”这三个动作并不是原子的，也不是线程安全的。因此在并发环境下，它的行为可能会超出你的预期，比如说有两个 goroutine 同时判断到数据不存在，那么它们都会尝试插入。

## Raw 和 RawWithContext

```go
	Raw(query string, args ...interface{}) RawSeter
	RawWithCtx(ctx context.Context, query string, args ...interface{}) RawSeter
```
执行原生查询。Beego 并不可能支持所有的 SQL 语法特性，因此在某些特殊情况下，你需要使用原生查询。

它会返回一个`RawSeter`，你可以参阅[RawSeter]()来确认该如何处理查询返回的结果集。

## LoadRelated 和 LoadRelatedWithCtx
它们的定义是：
```go
LoadRelated(md interface{}, name string, args ...utils.KV) (int64, error)
LoadRelatedWithCtx(ctx context.Context, md interface{}, name string, args ...utils.KV) (int64, error)
```

`LoadRelatedWithCtx` 已经被弃用。

这两个方法用于加载关联表的数据，例如：
```go
o.LoadRelated(post,"Tags")
for _,tag := range post.Tags{
    // 业务代码
}
```
该方法对

注意到，这两个方法最后一个参数都是传入 KV 值，目前这些 KV 值被定义在 `hints` 包里面，有：
- `hints.DefaultRelDepth`：设置关联表的解析深度为默认值 2；
- `hints.RelDepth`：设置自定义的关联表深度；
- `hints.Limit`：设置查询返回的行数；
- `hints.Offset`：设置查询结果的偏移量；
- `hints.OrderBy`：设置查询的排序；

这个方法要谨慎使用，尤其是在偏移量或者深度设置的值比较大的情况下，响应时间会比较长。

## QueryM2M 和 QueryM2MWithCtx
定义是：
```go
	QueryM2M(md interface{}, name string) QueryM2Mer
	QueryM2MWithCtx(ctx context.Context, md interface{}, name string) QueryM2Mer
```
`QueryM2MWithCtx`已经不建议使用了，因为`ctx`参数毫无效果。

这两个方法都是返回一个`QueryM2Mer`，用于查询多对多关联关系的数据。可以参考[./query.md#QueryM2Mer]
