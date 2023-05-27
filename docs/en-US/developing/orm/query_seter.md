---
title: QuerySeter
lang: en-US
---

# QuerySeter

ORM uses **QuerySeter** to organize queries.  Every method that returns  **QuerySeter** will give you a new **QuerySeter** object.

Basic Usage:

```go
o := orm.NewOrm()

// or
qs := o.QueryTable("user")

// or
qs = o.QueryTable(&User)

// or
user := new(User)
qs = o.QueryTable(user) // return QuerySeter

```

The methods of `QuerySeter` can be roughly divided into two categories:

- Intermediate methods: used to construct the query.
- Terminate methods: used to execute the query and encapsulate the result.
- Each api call that returns a QuerySeter creates a new QuerySeter, without affecting the previously created.
- Advanced queries use Filter and Exclude to do common conditional queries. 

## Query Expression

Beego has designed its own query expressions, which can be used in many methods.

In general, you can use expressions for fields in a single table, or you can use expressions on related tables. For example:
```go
qs.Filter("id", 1) // WHERE id = 1
```

Or in relationships:

```go
qs.Filter("profile__age", 18) // WHERE profile.age = 18
qs.Filter("Profile__Age", 18) // key name and field name are both valid
qs.Filter("profile__age", 18) // WHERE profile.age = 18
qs.Filter("profile__age__gt", 18) // WHERE profile.age > 18
qs.Filter("profile__age__gte", 18) // WHERE profile.age >= 18
qs.Filter("profile__age__in", 18, 20) // WHERE profile.age IN (18, 20)

qs.Filter("profile__age__in", 18, 20).Exclude("profile__lt", 1000)
// WHERE profile.age IN (18, 20) AND NOT profile_id < 1000
```

For example, if the User table has a foreign key for Profile, then if the User table is queried for the corresponding Profile.Age, then `Profile__Age` is used. Note that the field separators use the double underscore `__` for the field separator.

Operators can be added to the end of an expression to perform the corresponding sql operation. For example, `Profile__Age__gt` represents a conditional query for `Profile.Age > 18`. If no operator is specified, `=` will be used as the operator.

The supported operators:

* [exact](#exact) / [iexact](#iexact) - equal to
* [contains](#contains) / [icontains](#icontains) - contains
* [gt / gte](#gt-gte) - greater than / greater than or equal to
* [lt / lte](#lt-lte) - less than / less than or equal to
* [startswith](#startswith) / [istartswith](#istartswith) - starts with
* [endswith](#endswith) / [iendswith](#iendswith) - ends with
* [in](#in)
* [isnull](#isnull)

The operators that start with `i` ignore case.

### exact

Default values of Filter, Exclude and Condition expr

```go
qs.Filter("name", "slene") // WHERE name = 'slene'
qs.Filter("name__exact", "slene") // WHERE name = 'slene'
// using = , case sensitive or not is depending on which collation database table is used
qs.Filter("profile", nil) // WHERE profile_id IS NULL
```

### iexact

```go
qs.Filter("name__iexact", "slene")
// WHERE name LIKE 'slene'
// Case insensitive, will match any name that equals to 'slene'
```

### contains

```go
qs.Filter("name__contains", "slene")
// WHERE name LIKE BINARY '%slene%'
// Case sensitive, only match name that contains 'slene'
```

### icontains

```go
qs.Filter("name__icontains", "slene")
// WHERE name LIKE '%slene%'
// Case insensitive, will match any name that contains 'slene'
```

### in

```go
qs.Filter("profile__age__in", 17, 18, 19, 20)
// WHERE profile.age IN (17, 18, 19, 20)
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
// Case sensitive, only match name that starts with 'slene'
```

### istartswith

```go
qs.Filter("name__istartswith", "slene")
// WHERE name LIKE 'slene%'
// Case insensitive, will match any name that starts with 'slene'
```

### endswith

```go
qs.Filter("name__endswith", "slene")
// WHERE name LIKE BINARY '%slene'
// Case sensitive, only match name that ends with 'slene'
```

### iendswith

```go
qs.Filter("name__iendswith", "slene")
// WHERE name LIKE '%slene'
// Case insensitive, will match any name that ends with 'slene'
```

### isnull

```go
qs.Filter("profile__isnull", true)
qs.Filter("profile_id__isnull", true)
// WHERE profile_id IS NULL

qs.Filter("profile__isnull", false)
// WHERE profile_id IS NOT NULL
```

## Intermediate Methods

### Filter

Used to filter the result for the **include conditions**.

Use `AND` to connect multiple filters:

```go
qs.Filter("profile__isnull", true).Filter("name", "slene")
// WHERE profile_id IS NULL AND name = 'slene'
```

### FilterRaw

```go
FilterRaw(string, string) QuerySeter
```

This method treats the input directly as a query condition, so if there is an error in the input, then the resulting spliced SQL will not work. Beego itself does not perform any checks.

For example：

```go
qs.FilterRaw("user_id IN (SELECT id FROM profile WHERE age>=18)")
//sql-> WHERE user_id IN (SELECT id FROM profile WHERE age>=18)
```

### Exclude

Used to filter the result for the **exclude conditions**.

Use `NOT` to exclude condition
Use `AND` to connect multiple filters:

```go
qs.Exclude("profile__isnull", true).Filter("name", "slene")
// WHERE NOT profile_id IS NULL AND name = 'slene'
```


### SetCond

Custom conditions:

```go
cond := NewCondition()
cond1 := cond.And("profile__isnull", false).AndNot("status__in", 1).Or("profile__age__gt", 2000)

qs := orm.QueryTable("user")
qs = qs.SetCond(cond1)
// WHERE ... AND ... AND NOT ... OR ...

cond2 := cond.AndCond(cond1).OrCond(cond.And("name", "slene"))
qs = qs.SetCond(cond2).Count()
// WHERE (... AND ... AND NOT ... OR ...) OR ( ... )
```

### GetCond

```go
GetCond() *Condition
```

It returns all conditions:

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

Limit maximum returned lines. The second param can set `Offset`.

```go
var DefaultRowsLimit = 1000 // The default limit of ORM is 1000

// LIMIT 1000

qs.Limit(10)
// LIMIT 10

qs.Limit(10, 20)
// LIMIT 10 OFFSET 20

qs.Limit(-1)
// no limit

qs.Limit(-1, 100)
// LIMIT 18446744073709551615 OFFSET 100
// 18446744073709551615 is 1<<64 - 1. Used to set the condition which is no limit but with offset
```

If you do not call the method, or if you call the method but pass in a negative number, Beego will use the default value, e.g. 1000.

### Offset

Set offset lines:

```go
qs.Offset(20)
// LIMIT 1000 OFFSET 20
```
### GroupBy

```go
qs.GroupBy("id", "age")
// GROUP BY id,age
```

### OrderBy

```go
OrderBy(exprs ...string) QuerySeter
```

Cases:

- If the column names are passed in, then it means sort ascending by column name.
- If the column names with symbol `-` are passed in, then it means sort descending by column name.

Example:

```go
qs.OrderBy("id", "-profile__age")
// ORDER BY id ASC, profile.age DESC

qs.OrderBy("-profile__age", "profile")
// ORDER BY profile.age DESC, profile_id ASC
```

Similarly:

```go
qs.OrderBy("id", "-profile__age")
// ORDER BY id ASC, profile.age DESC

qs.OrderBy("-profile__age", "profile")
// ORDER BY profile.age DESC, profile_id ASC
```

### ForceIndex

Forcing DB to use the index.

You need to check your DB whether it support this feature.

```go
qs.ForceIndex(`idx_name1`,`idx_name2`)
```

### UseIndex

Suggest DB to user the index.

You need to check your DB whether it support this feature.

```go
qs.UseIndex(`idx_name1`,`idx_name2`)
```

### IgnoreIndex

Make DB ignore the index.

You need to check your DB whether it support this feature.

```go
qs.IgnoreIndex(`idx_name1`,`idx_name2`)
```

### RelatedSel

```go
RelatedSel(params ...interface{}) QuerySeter
```

Loads the data of the associated table. If no parameters are passed, then Beego loads the data of all related tables. If parameters are passed, then only the specific table data is loaded.

When loading, if the corresponding field is available as NULL, then LEFT JOIN is used. Otherwise JOIN is used.

Example:

```go
// Use LEFT JOIN to load all the related table data of table user
qs.RelatedSel().One(&user)
// Use LEFT JOIN to load only the data of the profile of table user
qs.RelatedSel("profile").One(&user)
user.Profile.Age = 32
```

Calling RelatedSel directly by default will perform a relational query at the maximum `DefaultRelsDepth`.

### Distinct

Same as `distinct` statement in sql, return only distinct (different) values

```go
qs.Distinct()
// SELECT DISTINCT
```

### ForUpdate

```go
ForUpdate() QuerySeter
```

Add FOR UPDATE clause.

### PrepareInsert

```go
PrepareInsert() (Inserter, error)
```

Used to prepare multiple insert inserts at once to increase the speed of bulk insertion.

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
i.Close() // don't forget to close statement
```

### Aggregate

```go
Aggregate(s string) QuerySeter
```

Using aggregate functions:

```go
type result struct {
  DeptName string
  Total    int
}
var res []result
o.QueryTable("dept_info").Aggregate("dept_name,sum(salary) as total").GroupBy("dept_name").All(&res)
```

## Terminate Methods

### Count

```go
Count() (int64, error)
```

Return line count based on the current query.

### Exist

```go
Exist() bool
```

Determines if the query returns data. Equivalent to `Count()` to return a value greater than 0.

### Update

Execute batch updating based on the current query:

```go
num, err := o.QueryTable("user").Filter("name", "slene").Update(orm.Params{
	"name": "astaxie",
})
fmt.Printf("Affected Num: %s, %s", num, err)
// SET name = "astaixe" WHERE name = "slene"
```

Atom operation add field:

```go
// Assume there is a nums int field in user struct
num, err := o.QueryTable("user").Update(orm.Params{
	"nums": orm.ColValue(orm.Col_Add, 100),
})
// SET nums = nums + 100
```

orm.ColValue supports:

```go
Col_Add      // plus
Col_Minus    // minus 
Col_Multiply // multiply 
Col_Except   // divide
```

### Delete

```go
Delete() (int64, error)
```

Execute batch deletion based on the current query.

### All

Return the related ResultSet.

Param of `All` supports `*[]Type` and `*[]*Type`.

```go
var users []*User
num, err := o.QueryTable("user").Filter("name", "slene").All(&users)
fmt.Printf("Returned Rows Num: %s, %s", num, err)
```

All / Values / ValuesList / ValuesFlat will be limited by [Limit](#limit). 1000 lines by default.

The returned fields can be specified:

```go
type Post struct {
	Id      int
	Title   string
	Content string
	Status  int
}

// Only return Id and Title
var posts []Post
o.QueryTable("post").Filter("Status", 1).All(&posts, "Id", "Title")
```

The other fields of the object are set to the default value of the field's type.

### One

Try to return one record:

```go
var user User
err := o.QueryTable("user").Filter("name", "slene").One(&user)
if err == orm.ErrMultiRows {
	// Have multiple records
	fmt.Printf("Returned Multi Rows Not One")
}
if err == orm.ErrNoRows {
	// No result 
	fmt.Printf("Not row found")
}
```

The returned fields can be specified:

```go
// Only return Id and Title
var post Post
o.QueryTable("post").Filter("Content__istartswith", "prefix string").One(&post, "Id", "Title")
```

The other fields of the object are set to the default value of the fields' type.
### Values

Return key => value of result set.

key is Field name in Model. value type if string.

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

Return specific fields:

**TODO**: doesn't support recursive query. **RelatedSel** return Values directly

But it can specify the value needed by expr.

```go
var maps []orm.Params
num, err := o.QueryTable("user").Values(&maps, "id", "name", "profile", "profile__age")
if err == nil {
fmt.Printf("Result Nums: %d\n", num)
for _, m := range maps {
fmt.Println(m["Id"], m["Name"], m["Profile"], m["Profile__Age"])
// There is no complicated nesting data in the map
}
}
```

### ValuesList

The result set will be stored as a slice.

The order of the result is same as the Fields order in the Model definition.

The values are saved as strings.

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

It can return specific fields by setting expr.

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

Only returns a single values slice of a specific field.

```go
var list orm.ParamsList
num, err := o.QueryTable("user").ValuesFlat(&list, "name")
if err == nil {
	fmt.Printf("Result Nums: %d\n", num)
	fmt.Printf("All User Names: %s", strings.Join(list, ", "))
}
```

### RowsToMap and RowsToStruct

Not implemented.
