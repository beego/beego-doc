---
title: 关联表查询
lang: en-US
---

# 关联表查询

For querying relationships, you can use [QuerySeter](./query_seter.md) or `QueryM2Mer`。

For example：

```go
o := orm.NewOrm()
post := Post{Id: 1}
m2m := o.QueryM2M(&post, "Tags")
// In the first param object must have primary key
// The second param is the M2M field will work with
// API of QueryM2Mer will used to Post with id equals 1
```

Full API:

- [Add(...interface{}) (int64, error)](#querym2mer-add)
- [Remove(...interface{}) (int64, error)](#querym2mer-remove)
- [Exist(interface{}) bool](#querym2mer-exist)
- [Clear() (int64, error)](#querym2mer-clear)
- [Count() (int64, error)](#querym2mer-count)

## QueryM2Mer Add

```go
tag := &Tag{Name: "golang"}
o.Insert(tag)

num, err := m2m.Add(tag)
if err == nil {
	fmt.Println("Added nums: ", num)
}
```

`Add` accepts `Tag`,`*Tag`,`[]*Tag`,`[]Tag`,`[]interface{}`。

```go
var tags []*Tag
...
// After reading tags
...
num, err := m2m.Add(tags)
if err == nil {
    fmt.Println("Added nums: ", num)
}
// It can pass multiple params
// m2m.Add(tag1, tag2, tag3)
```

## QueryM2Mer Remove

Remove tag from M2M relation:

Remove supports many types: Tag *Tag []*Tag []Tag []interface{}

```go
var tags []*Tag
...
// After reading tags
...
num, err := m2m.Remove(tags)
if err == nil {
    fmt.Println("Removed nums: ", num)
}
// It can pass multiple params
// m2m.Remove(tag1, tag2, tag3)
```

## QueryM2Mer Exist

Test if Tag is in M2M relation

```go
if m2m.Exist(&Tag{Id: 2}) {
    fmt.Println("Tag Exist")
}
```

## QueryM2Mer Clear

Clear all M2M relation:

```go
nums, err := m2m.Clear()
if err == nil {
    fmt.Println("Removed Tag Nums: ", nums)
}
```

## QueryM2Mer Count

Count the number of Tags:

```go
nums, err := m2m.Count()
if err == nil {
    fmt.Println("Total Nums: ", nums)
}
```
