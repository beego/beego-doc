---
title: 国际化
lang: zh
---

# 国际化介绍

i18n 模块主要用于实现站点或应用的国际化功能，实现多语言界面与反馈，增强用户体验。

您可以通过以下方式安装该模块：

```shell
go get github.com/beego/i18n
```

## i18n 使用

首先，您需要导入该包：

```go
import (
	    "github.com/beego/i18n"
	)
```

该模块主要采用的是键值对的形式，非常类似 INI 格式的配置文件，但又在此基础上增强了一些功能。每个语种均对应一个本地化文件，例如 Beego 官网的 `conf` 目录下就有 `locale_en-US.ini` 和 `locale_zh-CN.ini` 两个本地化文件。

本地化文件的文件名和后缀是随意的，不过我们建议您采用与 Beego 官网相同的风格来对它们命名。

下面是两个最简单的本地化文件示例：

文件 `locale_en-US.ini`：

```ini
hi = hello
bye = goodbye
```

文件 `locale_zh-CN.ini`：

```ini
hi = 您好
bye = 再见
```

## 在控制器中使用

对于每个请求，Beego 都会采用单独的 goroutine 来处理，因此可以对每个控制器匿名嵌入一个 `i18n.Locale` 结构用于处理当前请求的本地化响应。这个要求您能够理解 Beego 的 `baseController` 理念和使用 `Prepare` 方法，具体可参考 Beego 官网的控制器源码部分 `routers/router.go`。

接受请求之后，在 `baseController` 的 `Prepare` 方法内进行语言处理，这样便可应用后所有其它控制器内而无需重复编写代码。

### 注册本地化文件

以下代码摘取自 beego 官网源码 `routers/init.go`：

```go
// Initialized language type list.
langs := strings.Split(beego.AppConfig.String("lang::types"), "|")
names := strings.Split(beego.AppConfig.String("lang::names"), "|")
langTypes = make([]*langType, 0, len(langs))
for i, v := range langs {
	langTypes = append(langTypes, &langType{
		Lang: v,
		Name: names[i],
	})
}

for _, lang := range langs {
	beego.Trace("Loading language: " + lang)
	if err := i18n.SetMessage(lang, "conf/"+"locale_"+lang+".ini"); err != nil {
		beego.Error("Fail to set message file: " + err.Error())
		return
	}
}
```

在这段代码中，我们首先从配置文件中获取我们需要支持的语言种类，例如官网支持的语言有 `en-US` 和 `zh-CN`。接着初始化了一个用于实现用户自由切换语言的 slice（此处不做讨论），最后，根据我们需要支持的语言种类，采用一个循环内调用 `i18n.SetMessage` 加载所有本地化文件。此时，您应该明白为什么我们推荐您采用标准化的形式命名您的本地化文件。

### 初始化控制器语言

下面的代码摘取自 Beego 官网的控制器语言处理部分 `routers/router.go`，依次根据 URL 指定、Cookies 和浏览器 Accept-Language 来获取用户语言选项，然后设置控制器级别的语言。

```go
// setLangVer sets site language version.
func (this *baseRouter) setLangVer() bool {
	isNeedRedir := false
	hasCookie := false

	// 1. Check URL arguments.
	lang := this.Input().Get("lang")

	// 2. Get language information from cookies.
	if len(lang) == 0 {
		lang = this.Ctx.GetCookie("lang")
		hasCookie = true
	} else {
		isNeedRedir = true
	}

	// Check again in case someone modify by purpose.
	if !i18n.IsExist(lang) {
		lang = ""
		isNeedRedir = false
		hasCookie = false
	}

	// 3. Get language information from 'Accept-Language'.
	if len(lang) == 0 {
		al := this.Ctx.Request.Header.Get("Accept-Language")
		if len(al) > 4 {
			al = al[:5] // Only compare first 5 letters.
			if i18n.IsExist(al) {
				lang = al
			}
		}
	}

	// 4. Default language is English.
	if len(lang) == 0 {
		lang = "en-US"
		isNeedRedir = false
	}

	curLang := langType{
		Lang: lang,
	}

	// Save language information in cookies.
	if !hasCookie {
		this.Ctx.SetCookie("lang", curLang.Lang, 1<<31-1, "/")
	}

	restLangs := make([]*langType, 0, len(langTypes)-1)
	for _, v := range langTypes {
		if lang != v.Lang {
			restLangs = append(restLangs, v)
		} else {
			curLang.Name = v.Name
		}
	}

	// Set language properties.
	this.Lang = lang
	this.Data["Lang"] = curLang.Lang
	this.Data["CurLang"] = curLang.Name
	this.Data["RestLangs"] = restLangs

	return isNeedRedir
}
```

其中，`isNeedRedir` 变量用于表示用户是否是通过 URL 指定来决定语言选项的，为了保持 URL 整洁，官网在遇到这种情况时自动将语言选项设置到 Cookies 中然后重定向。

代码 `this.Data["Lang"] = curLang.Lang` 是将用户语言选项设置到名为 `Lang` 的模板变量中，使得能够在模板中处理语言问题。

以下两行：

```
	this.Data["CurLang"] = curLang.Name
	this.Data["RestLangs"] = restLangs
```

主要用于实现用户自由切换语言，具体实现原理请参考 beego 官网源码。

### 控制器语言处理

当作为匿名字段嵌入到 `baseController` 之后，直接通过 `this.Tr(format string, args ...interface{})` 即可进行语言处理。

## 在视图模板中使用

通过在控制器中传入一个 `Lang` 变量来指示语言选项后，就可以在模板中进行本地化处理，不过在这之前，需要先注册一个模板函数。

以下代码摘取自 beego 官网源码 `beeweb.go`：

```go
beego.AddFuncMap("i18n", i18n.Tr)
```

注册完成之后，便可配合 `Lang` 变量在模板中进行语言处理：

```
{{i18n .Lang "hi%d" 12}}
```

以上代码会输出：

- 英文 `en-US`：`hello12`
- 中文 `zh-CN`：`您好12`

## 分区功能

针对不同页面，同一个键的名称很可能会对应不同的含义。因此，i18n 模块还利用 INI 格式配置文件的节特性来实现分区功能。

例如，同样是键名 `about`，在首页需要显示为 `关于`，而在关于页面需要显示为 `关于我们`，则可以通过分区功能来实现。

本地化文件中的内容：

```ini
about = About

[about]
about = About Us
```

获取首页的 `about`：

```
{{i18n .Lang "about"}}
```

获取关于页面的 `about`：

```
{{i18n .Lang "about.about"}}
```

### 歧义处理

由于 `.` 是作为分区的标志，所以当您的键名出现该符号的时候，会出现歧义导致语言处理失败。这时，您只需要在整个键名前加上一个额外的 `.` 即可避免歧义。

例如，我们的键名为 `about.`，为了避免歧义，我们需要使用：

```
{{i18n .Lang ".about."}}
```

来获取正确的本地化结果。

## 命令行工具

i18n 模块提供命令行工具 beei18n 来帮助简化开发中的一些步骤。您可以通过以下方式安装：

```shell
go get github.com/beego/i18n/beei18n
```

### 同步本地化文件

命令 `sync` 允许您使用已经创建好的一个本地化文件为模板，创建或同步其它的本地化文件：

```shell
beei18n sync srouce_file.ini other1.ini other2.ini
```

该命令可以同时操作 1 个或多个文件。

## 其它说明

如果未找到相应键的对应值，则会输出键的原字符串。例如：当键为 `hi` 但未在本地化文件中找到以该字符串命名的键，则会将 `hi` 作为字符串返回给调用者。