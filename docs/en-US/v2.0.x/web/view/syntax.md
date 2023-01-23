---
title: 模板语法
lang: zh
---

# 模板语法

go 统一使用了 `{{` 和 `}}` 作为左右标签，没有其他的标签符号。如果您想要修改为其它符号，可以参考 [模板标签](http://Beego.me/docs/mvc/view/view.md#%E6%A8%A1%E6%9D%BF%E6%A0%87%E7%AD%BE)。

使用 `.` 来访问当前位置的上下文

使用 `$` 来引用当前模板根级的上下文

使用 `$var` 来访问创建的变量

**模板中支持的 go 语言符号**

```html
{{"string"}} // 一般 string {{`raw string`}} // 原始 string {{'c'}} // byte
{{print nil}} // nil 也被支持
```

**模板中的 pipeline**

可以是上下文的变量输出，也可以是函数通过管道传递的返回值

```
{{. | FuncA | FuncB | FuncC}}
```

当 `pipeline` 的值等于:

- `false` 或 0
- `nil` 的指针或 `interface`
- 长度为 0 的 `array`, `slice`, `map`, `string`

那么这个 `pipeline` 被认为是空

### if ... else ... end

```html
{{if pipeline}}{{end}}
```

`if` 判断时，`pipeline` 为空时，相当于判断为 `False`

```go
this.Data["IsLogin"] = true
this.Data["IsHome"] = true
this.Data["IsAbout"] = true
```

支持嵌套的循环

```go
{{if .IsHome}}
{{else}}
	{{if .IsAbout}}{{end}}
{{end}}
```

也可以使用 `else if` 进行

```html
{{if .IsHome}} {{else if .IsAbout}} {{else}} {{end}}
```

### range ... end

```html
{{range pipeline}}{{.}}{{end}}
```

`pipeline` 支持的类型为 `array`, `slice`, `map`, `channel`

range 循环内部的 `.` 改变为以上类型的子元素

对应的值长度为 0 时，`range` 不会执行，`.` 不会改变

```go
pages := []struct {
	Num int
}{{10}, {20}, {30}}

this.Data["Total"] = 100
this.Data["Pages"] = pages
```

使用 `.Num` 输出子元素的 Num 属性，使用 `$.` 引用模板中的根级上下文

```html
{{range .Pages}} {{.Num}} of {{$.Total}} {{end}}
```

使用创建的变量，在这里和 go 中的 range 用法是相同的。

```html
{{range $index, $elem := .Pages}} {{$index}} - {{$elem.Num}} - {{.Num}} of
{{$.Total}} {{end}}
```

`range` 也支持 `else`

```html
{{range .Pages}} {{else}} {{/* 当 .Pages 为空 或者 长度为 0 时会执行这里 */}}
{{end}}
```

### with ... end

```html
{{with pipeline}}{{end}}
```

`with` 用于重定向 `pipeline`

```html
{{with .Field.NestField.SubField}} {{.Var}} {{end}}
```

也可以对变量赋值操作

```html
{{with $value := "My name is %s"}} {{printf . "slene"}} {{end}}
```

with 也支持 else

```html
{{with pipeline}} {{else}} {{/* 当 pipeline 为空时会执行这里 */}} {{end}}
```

### define

define 可以用来定义自模板，可用于模块定义和模板嵌套

```html
{{define "loop"}}
<li>{{.Name}}</li>
{{end}}
```

使用 `template` 调用模板

```html
<ul>
  {{range .Items}} {{template "loop" .}} {{end}}
</ul>
```

### template

```html
{{template "模板名" pipeline}}
```

将对应的上下文 `pipeline` 传给模板，才可以在模板中调用

**Beego 中支持直接载入文件模板**

```html
{{template "path/to/head.html" .}}
```

Beego 会依据你设置的模板路径读取 head.html

在模板中可以接着载入其他模板，对于模板的分模块处理很有用处

### 注释

允许多行文本注释，不允许嵌套

```html
{{/* comment content support new line */}}
```

## 基本函数

变量可以使用符号 `|` 在函数间传递

```html
{{.Con | markdown | addlinks}}
```

```html
{{.Name | printf "%s"}}
```

使用括号

```html
{{printf "nums is %s %d" (printf "%d %d" 1 2) 3}}
```

### and

```html
{{and .X .Y .Z}}
```

and 会逐一判断每个参数，将返回第一个为空的参数，否则就返回最后一个非空参数

### call

```html
{{call .Field.Func .Arg1 .Arg2}}
```

call 可以调用函数，并传入参数

调用的函数需要返回 1 个值 或者 2 个值，返回两个值时，第二个值用于返回 error 类型的错误。返回的错误不等于 nil 时，执行将终止。

### index

index 支持 map, slice, array, string，读取指定类型对应下标的值

```go
this.Data["Maps"] = map[string]string{"name": "Beego"}
```

```html
{{index .Maps "name"}}
```

### len

```html
{{printf "The content length is %d" (.Content|len)}}
```

返回对应类型的长度，支持类型：map, slice, array, string, chan

### not

`not` 返回输入参数的否定值，`if true then false else true`

### or

```html
{{or .X .Y .Z}}
```

or 会逐一判断每个参数，将返回第一个非空的参数，否则就返回最后一个参数

### print

对应 `fmt.Sprint`

### printf

对应 `fmt.Sprintf`

### println

对应 `fmt.Sprintln`

### urlquery

```html
{{urlquery "http://beego.vip"}}
```

将返回

```
http%3A%2F%2Fbeego.vip
```

### eq / ne / lt / le / gt / ge

这类函数一般配合在 if 中使用

`eq`: `arg1 == arg2`
`ne`: `arg1 != arg2`
`lt`: `arg1 < arg2`
`le`: `arg1 <= arg2`
`gt`: `arg1 > arg2`
`ge`: `arg1 >= arg2`

eq 和其他函数不一样的地方是，支持多个参数，和下面的逻辑判断相同

```html
arg1==arg2 || arg1==arg3 || arg1==arg4 ...
```

与 if 一起使用

```html
{{if eq true .Var1 .Var2 .Var3}}{{end}}
```

```html
{{if lt 100 200}}{{end}}
```
