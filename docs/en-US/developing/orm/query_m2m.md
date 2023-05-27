---
title: Relationships
lang: en-US
---

# Relationships

For querying relationships, you can use [QuerySeter](./query_seter.md) or `QueryM2Mer`.

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

- [Relationships](#relationships)
  - [QueryM2Mer Add](#querym2mer-add)
  - [QueryM2Mer Remove](#querym2mer-remove)
  - [QueryM2Mer Exist](#querym2mer-exist)
  - [QueryM2Mer Clear](#querym2mer-clear)
  - [QueryM2Mer Count](#querym2mer-count)

## QueryM2Mer Add

```go
tag := &Tag{Name: "golang"}
o.Insert(tag)

num, err := m2m.Add(tag)
if err == nil {
	fmt.Println("Added nums: ", num)
}
```

`Add` accepts `Tag`,`*Tag`,`[]*Tag`,`[]Tag`,`[]interface{}`.

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

Remove supports many types: `Tag`,`*Tag`,`[]*Tag`,`[]Tag`,`[]interface{}`.

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

Test if Tag is in M2M relation:

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
