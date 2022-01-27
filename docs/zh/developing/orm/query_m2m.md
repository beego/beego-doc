---
title: 关联表查询
lang: zh
---

# 关联表查询

关联表的查询，一方面可以使用[QuerySeter](./query_seter.md)，一方面也可以使用`QueryM2Mer`。

创建一个 `QueryM2Mer` 对象：

```go
o := orm.NewOrm()
post := Post{Id: 1}
m2m := o.QueryM2M(&post, "Tags")
// 第一个参数的对象，主键必须有值
// 第二个参数为对象需要操作的 M2M 字段
// QueryM2Mer 的 api 将作用于 Id 为 1 的 Post
```

它的具体 API 有：

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

`Add` 支持多种类型 `Tag`,`*Tag`,`[]*Tag`,`[]Tag`,`[]interface{}`。

```go
var tags []*Tag
...
// 读取 tags 以后
...
num, err := m2m.Add(tags)
if err == nil {
	fmt.Println("Added nums: ", num)
}
// 也可以多个作为参数传入
// m2m.Add(tag1, tag2, tag3)
```

## QueryM2Mer Remove

从 M2M 关系中删除 `tag`

`Remove` 支持多种类型 `Tag` `*Tag` `[]*Tag` `[]Tag` `[]interface{}`

```go
var tags []*Tag
...
// 读取 tags 以后
...
num, err := m2m.Remove(tags)
if err == nil {
	fmt.Println("Removed nums: ", num)
}
// 也可以多个作为参数传入
// m2m.Remove(tag1, tag2, tag3)
```

## QueryM2Mer Exist

判断 Tag 是否存在于 M2M 关系中

```go
if m2m.Exist(&Tag{Id: 2}) {
	fmt.Println("Tag Exist")
}
```

## QueryM2Mer Clear

清除所有 M2M 关系

```go
nums, err := m2m.Clear()
if err == nil {
	fmt.Println("Removed Tag Nums: ", nums)
}
```

## QueryM2Mer Count

计算 Tag 的数量

```go
nums, err := m2m.Count()
if err == nil {
	fmt.Println("Total Nums: ", nums)
}
```
