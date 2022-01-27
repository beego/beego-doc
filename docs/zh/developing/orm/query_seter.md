---
title: QuerySeter 构造复杂查询
lang: zh
---

# QuerySeter 复杂查询

ORM 以 **QuerySeter** 来组织查询，每个返回 **QuerySeter** 的方法都会获得一个新的 **QuerySeter** 对象。

基本使用方法:

```go
o := orm.NewOrm()

// 获取 QuerySeter 对象，user 为表名
qs := o.QueryTable("user")

// 也可以直接使用 Model 结构体作为表名
qs = o.QueryTable(&User)

// 也可以直接使用对象作为表名
user := new(User)
qs = o.QueryTable(user) // 返回 QuerySeter

// 后面可以调用qs上的方法，执行复杂查询。
```

`QuerySeter`的方法大体上可以分成两类：

- 中间方法：用于构造查询
- 终结方法：用于执行查询并且封装结果

* 每个返回 QuerySeter 的 api 调用时都会新建一个 QuerySeter，不影响之前创建的。

* 高级查询使用 Filter 和 Exclude 来做常用的条件查询。囊括两种清晰的过滤规则：包含， 排除

## 查询表达式

Beego 设计了自己的查询表达式，这些表达式可以用在很多方法上。

一般来说，你可以对单表的字段使用表达式，也可以在关联表上使用表达式。例如单个使用：

```go
qs.Filter("id", 1) // WHERE id = 1
```

或者在关联表里面使用：

```go
qs.Filter("profile__age", 18) // WHERE profile.age = 18
qs.Filter("Profile__Age", 18) // 使用字段名和 Field 名都是允许的
qs.Filter("profile__age__gt", 18) // WHERE profile.age > 18
// WHERE profile.age IN (18, 20) AND NOT profile_id < 1000
```

字段组合的前后顺序依照表的关系，比如 User 表拥有 Profile 的外键，那么对 User 表查询对应的 Profile.Age 为条件，则使用 `Profile__Age` 注意，字段的分隔符号使用双下划线 `__`。

除了描述字段， 表达式的尾部可以增加操作符以执行对应的 sql 操作。比如 `Profile__Age__gt` 代表 Profile.Age > 18 的条件查询。在没有指定操作符的情况下，会使用`=`作为操作符。

当前支持的操作符号：

- [exact](#exact) / [iexact](#iexact) 等于
- [contains](#contains) / [icontains](#icontains) 包含
- [gt / gte](#gt-gte) 大于 / 大于等于
- [lt / lte](#lt-lte) 小于 / 小于等于
- [startswith](#startswith) / [istartswith](#istartswith) 以...起始
- [endswith](#endswith) / [iendswith](#iendswith) 以...结束
- [in](#in)
- [isnull](#isnull)

后面以 `i` 开头的表示：大小写不敏感

### exact

Filter / Exclude / Condition expr 的默认值

```go
qs.Filter("name", "slene") // WHERE name = 'slene'
qs.Filter("name__exact", "slene") // WHERE name = 'slene'
// 使用 = 匹配，大小写是否敏感取决于数据表使用的 collation
qs.Filter("profile_id", nil) // WHERE profile_id IS NULL
```

### iexact

```go
qs.Filter("name__iexact", "slene")
// WHERE name LIKE 'slene'
// 大小写不敏感，匹配任意 'Slene' 'sLENE'
```

### contains

```go
qs.Filter("name__contains", "slene")
// WHERE name LIKE BINARY '%slene%'
// 大小写敏感, 匹配包含 slene 的字符
```

### icontains

```go
qs.Filter("name__icontains", "slene")
// WHERE name LIKE '%slene%'
// 大小写不敏感, 匹配任意 'im Slene', 'im sLENE'
```

### in

```go
qs.Filter("age__in", 17, 18, 19, 20)
// WHERE age IN (17, 18, 19, 20)


ids:=[]int{17,18,19,20}
qs.Filter("age__in", ids)
// WHERE age IN (17, 18, 19, 20)

// 同上效果
```

### gt / gte

```go
qs.Filter("profile__age__gt", 17)
// WHERE profile.age > 17

qs.Filter("profile__age__gte", 18)
// WHERE profile.age >= 18
```

### lt / lte

```go
qs.Filter("profile__age__lt", 17)
// WHERE profile.age < 17

qs.Filter("profile__age__lte", 18)
// WHERE profile.age <= 18
```

### startswith

```go
qs.Filter("name__startswith", "slene")
// WHERE name LIKE BINARY 'slene%'
// 大小写敏感, 匹配以 'slene' 起始的字符串
```

### istartswith

```go
qs.Filter("name__istartswith", "slene")
// WHERE name LIKE 'slene%'
// 大小写不敏感, 匹配任意以 'slene', 'Slene' 起始的字符串
```

### endswith

```go
qs.Filter("name__endswith", "slene")
// WHERE name LIKE BINARY '%slene'
// 大小写敏感, 匹配以 'slene' 结束的字符串
```

### iendswith

```go
qs.Filter("name__iendswithi", "slene")
// WHERE name LIKE '%slene'
// 大小写不敏感, 匹配任意以 'slene', 'Slene' 结束的字符串
```

### isnull

```go
qs.Filter("profile__isnull", true)
qs.Filter("profile_id__isnull", true)
// WHERE profile_id IS NULL

qs.Filter("profile__isnull", false)
// WHERE profile_id IS NOT NULL
```

## 中间方法

### Filter

```go
Filter(string, ...interface{}) QuerySeter
```

多次调用`Filter`方法，会使用`AND`将它们连起来。

```go
qs.Filter("profile__isnull", true).Filter("name", "slene")
// WHERE profile_id IS NULL AND name = 'slene'
```

### FilterRaw

```go
FilterRaw(string, string) QuerySeter
```

该方法会直接把输入当做是一个查询条件，因此如果输入有错误，那么拼接得来的 SQL 则无法运行。Beego 本身并不会执行任何的检查。

例如：

```go
qs.FilterRaw("user_id IN (SELECT id FROM profile WHERE age>=18)")
//sql-> WHERE user_id IN (SELECT id FROM profile WHERE age>=18)
```

### Exclude

```go
Exclude(string, ...interface{}) QuerySeter
```

准确来说，`Exclude`表达的是`NOT`的语义：

```go
qs.Filter("profile__age__in", 18, 20).Exclude("profile__lt", 1000)
// WHERE profile.age IN (18, 20) AND NOT profile_id < 1000
```

### SetCond

```go
SetCond(*Condition) QuerySeter
```

设置查询条件：

```go
cond := orm.NewCondition()
cond1 := cond.And("profile__isnull", false).AndNot("status__in", 1).Or("profile__age__gt", 2000)
//sql-> WHERE T0.`profile_id` IS NOT NULL AND NOT T0.`Status` IN (?) OR T1.`age` >  2000
num, err := qs.SetCond(cond1).Count()
```

`Condition`中使用的表达式，可以参考[查询表达式](#查询表达式)

### GetCond

```go
GetCond() *Condition
```

获得查询条件。例如：

```go
 cond := orm.NewCondition()
 cond = cond.And("profile__isnull", false).AndNot("status__in", 1)
 qs = qs.SetCond(cond)
 cond = qs.GetCond()
 cond := cond.Or("profile__age__gt", 2000)
 //sql-> WHERE T0.`profile_id` IS NOT NULL AND NOT T0.`Status` IN (?) OR T1.`age` >  2000
 num, err := qs.SetCond(cond).Count()
```

### Limit

```go
Limit(limit interface{}, args ...interface{}) QuerySeter
```

该方法第二个参数`args`实际上只是表达偏移量。也就是说：

- 如果你只传了`limit`，例如说 10，那么相当于`LIMIT 10`
- 如果你同时传了`args` 为 2， 那么相当于 `LIMIT 10 OFFSET 2`，或者说`LIMIT 2, 10`

```go
var DefaultRowsLimit = 1000 // ORM 默认的 limit 值为 1000

// 默认情况下 select 查询的最大行数为 1000
// LIMIT 1000

qs.Limit(10)
// LIMIT 10

qs.Limit(10, 20)
// LIMIT 10 OFFSET 20 注意跟 SQL 反过来的

qs.Limit(-1)
// no limit

qs.Limit(-1, 100)
// LIMIT 18446744073709551615 OFFSET 100
// 18446744073709551615 是 1<<64 - 1 用来指定无 limit 限制 但有 offset 偏移的情况
```

如果你没有调用该方法，或者调用了该方法，但是传入了一个负数，Beego 会使用默认的值，例如 1000。

### Offset

```go
Offset(offset interface{}) QuerySeter
```

设置偏移量，等同于`Limit`方法的第二个参数。

### GroupBy

```go
GroupBy(exprs ...string) QuerySeter
```

设置分组，参数是列名。

### OrderBy

```go
OrderBy(exprs ...string) QuerySeter
```

设置排序，使用的是一种特殊的表达：

- 如果传入的是列名，那么代表的是按照列名 ASC 排序；
- 如果传入的列名前面有一个负号，那么代表的是按照列名 DESC 排序；

例如：

```go
// ORDER BY STATUS DESC
qs.OrderBy("-status")
// ORDER BY ID ASC, STATUS DESC
qs.OrderBy("id", "-status")
```

同样地，也可以使用[查询表达式](#查询表达式)，例如：

```go
qs.OrderBy("id", "-profile__age")
// ORDER BY id ASC, profile.age DESC

qs.OrderBy("-profile__age", "profile")
// ORDER BY profile.age DESC, profile_id ASC
```

### ForceIndex

```go
qs.ForceIndex(`idx_name1`,`idx_name2`)
```

强制使用某个索引。你需要确认自己使用的数据库支持该特性，并且确认该特性在数据库上的语义。

参数是索引的名字。

### UseIndex

```go
UseIndex(indexes ...string) QuerySeter
```

使用某个索引。你需要确认自己使用的数据库支持该特性，并且确认该特性在数据库上的语义。比如说在一些数据库上，该特性是“建议使用某个索引”，但是数据库在真实执行查询的时候，完全可能不使用这里指定的索引。

参数是索引的名字。

### IgnoreIndex

```go
IgnoreIndex(indexes ...string) QuerySeter
```

忽略某个索引。你需要确认自己使用的数据库支持该特性，并且确认该特性在数据库上的语义。比如说在一些数据库上，该特性是“建议不使用某个索引”，但是数据库在真实执行查询的时候，完全可能使用这里指定的索引。

参数是索引的名字。

### RelatedSel

```go
RelatedSel(params ...interface{}) QuerySeter
```

加载关联表的数据。如果没有传入参数，那么 Beego 加载所有关联表的数据。而如果传入了参数，那么只会加载特定的关联表数据。

在加载的时候，如果对应的字段是可以为 NULL 的，那么会使用 LEFT JOIN，否则使用 JOIN。

例如：

```go
// 使用 LEFT JOIN 加载 user 里面的所有关联表数据
qs.RelatedSel().One(&user)
// 使用 LEFT JOIN 只加载 user 里面 profile 的数据
qs.RelatedSel("profile").One(&user)
user.Profile.Age = 32
```

默认情况下直接调用 RelatedSel 将进行最大`DefaultRelsDepth`层的关系查询

### Distinct

```go
Distinct() QuerySeter
```

为查询加上 DISTINCT 关键字

### ForUpdate

```go
ForUpdate() QuerySeter
```

为查询加上 FOR UPDATE 片段。

### PrepareInsert

```go
PrepareInsert() (Inserter, error)
```

用于一次 prepare 多次 insert 插入，以提高批量插入的速度。

```go
var users []*User
...
qs := o.QueryTable("user")
i, _ := qs.PrepareInsert()
for _, user := range users {
	id, err := i.Insert(user)
	if err == nil {
		...
	}
}
// PREPARE INSERT INTO user (`name`, ...) VALUES (?, ...)
// EXECUTE INSERT INTO user (`name`, ...) VALUES ("slene", ...)
// EXECUTE ...
// ...
i.Close() // 别忘记关闭 statement
```

### Aggregate

```go
Aggregate(s string) QuerySeter
```

指定聚合函数。例如：

```go
type result struct {
  DeptName string
  Total    int
}
var res []result
o.QueryTable("dept_info").Aggregate("dept_name,sum(salary) as total").GroupBy("dept_name").All(&res)
```

## 终结方法

### Count

```go
Count() (int64, error)
```

执行查询并且返回结果集的大小。

### Exist

```go
Exist() bool
```

判断查询是否返回数据。等效于`Count()` 返回大于 0 的值。

### Update

```go
Update(values Params) (int64, error)
```

依据当前查询条件，进行批量更新操作。

```go
num, err := o.QueryTable("user").Filter("name", "slene").Update(orm.Params{
	"name": "astaxie",
})
fmt.Printf("Affected Num: %s, %s", num, err)
// SET name = "astaixe" WHERE name = "slene"
```

原子操作增加字段值

```go
// 假设 user struct 里有一个 nums int 字段
num, err := o.QueryTable("user").Update(orm.Params{
	"nums": orm.ColValue(orm.ColAdd, 100),
})
// SET nums = nums + 100
```

`orm.ColValue` 支持以下操作

```go
ColAdd      // 加
ColMinus    // 减
ColMultiply // 乘
ColExcept   // 除
```

### Delete

```go
Delete() (int64, error)
```

删除数据，返回被删除的数据行数。

### All

```go
All(container interface{}, cols ...string) (int64, error)
```

返回对应的结果集对象。参数支持 `*[]Type` 和 `*[]*Type` 两种形式的切片

```go
var users []*User
num, err := o.QueryTable("user").Filter("name", "slene").All(&users)
fmt.Printf("Returned Rows Num: %s, %s", num, err)
```

`All / Values / ValuesList / ValuesFlat` 受到 [Limit](#limit) 的限制，默认最大行数为 1000

可以指定返回的字段：

```go
type Post struct {
	Id      int
	Title   string
	Content string
	Status  int
}

// 只返回 Id 和 Title
var posts []Post
o.QueryTable("post").Filter("Status", 1).All(&posts, "Id", "Title")
```

对象的其他字段值将会是对应类型的默认值。

### One

```go
One(container interface{}, cols ...string) error
```

尝试返回单条记录：

```go
var user User
err := o.QueryTable("user").Filter("name", "slene").One(&user)
if err == orm.ErrMultiRows {
	// 多条的时候报错
	fmt.Printf("Returned Multi Rows Not One")
}
if err == orm.ErrNoRows {
	// 没有找到记录
	fmt.Printf("Not row found")
}
```

### Values

```go
Values(results *[]Params, exprs ...string) (int64, error)
```

返回结果集的 `key => value` 值

key 为模型里的字段名, value 是`interface{}`类型,例如，如果你要将 value 赋值给 struct 中的某字段，需要根据结构体对应字段类型使用[断言](https://golang.org/ref/spec#Type_assertions)获取真实值。:`Name : m["Name"].(string)`

```go
var maps []orm.Params
num, err := o.QueryTable("user").Values(&maps)
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	for _, m := range maps {
		fmt.Println(m["Id"], m["Name"])
	}
}
```

**TODO**: 暂不支持级联查询 **RelatedSel** 直接返回 Values

第二个参数可以是列名，也可以是查询表达式：

```go
var maps []orm.Params
num, err := o.QueryTable("user").Values(&maps, "id", "name", "profile", "profile__age")
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	for _, m := range maps {
		fmt.Println(m["Id"], m["Name"], m["Profile"], m["Profile__Age"])
		// map 中的数据都是展开的，没有复杂的嵌套
	}
}
```

### ValuesList

```go
ValuesList(results *[]ParamsList, exprs ...string) (int64, error)
```

顾名思义，返回的结果集以切片存储，其排列与模型中定义的字段顺序一致，每个元素值是 string 类型。

```go
var lists []orm.ParamsList
num, err := o.QueryTable("user").ValuesList(&lists)
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	for _, row := range lists {
		fmt.Println(row)
	}
}
```

当然也可以指定查询表达式返回指定的字段：

```go
var lists []orm.ParamsList
num, err := o.QueryTable("user").ValuesList(&lists, "name", "profile__age")
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	for _, row := range lists {
		fmt.Printf("Name: %s, Age: %s\m", row[0], row[1])
	}
}
```

### ValuesFlat

```go
ValuesFlat(result *ParamsList, expr string) (int64, error)
```

只返回特定的字段的值，将结果集展开到单个切片里。

```go
var list orm.ParamsList
num, err := o.QueryTable("user").ValuesFlat(&list, "name")
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	fmt.Printf("All User Names: %s", strings.Join(list, ", "))
}
```

### RowsToMap 和 RowsToStruct

这两个方法都没有实现。
