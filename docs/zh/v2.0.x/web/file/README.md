---
title: Web 文件上传下载
lang: zh
---

# Web 文件上传下载

## 文件上传

在 Beego 中你可以很容易的处理文件上传，就是别忘记在你的表单中增加这个属性 `enctype="multipart/form-data"`，否则你的浏览器不会传输你的上传文件。

文件上传之后一般是放在系统的内存里面，如果文件的 size 大于设置的缓存内存大小，那么就放在临时文件中，默认的缓存内存是 64M，你可以通过如下来调整这个缓存内存大小:

```
web.MaxMemory = 1<<22
```

或者在配置文件中通过如下设置：

```
maxmemory = 1<<22
```

与此同时，Beego 提供了另外一个参数，`MaxUploadSize`来限制最大上传文件大小——如果你一次长传多个文件，那么它限制的就是这些所有文件合并在一起的大小。

默认情况下，`MaxMemory`应该设置得比`MaxUploadSize`小，这种情况下两个参数合并在一起的效果则是：

1. 如果文件大小小于`MaxMemory`，则直接在内存中处理；
2. 如果文件大小介于`MaxMemory`和`MaxUploadSize`之间，那么比`MaxMemory`大的部分将会放在临时目录；
3. 文件大小超出`MaxUploadSize`，直接拒绝请求，返回响应码 413

Beego 提供了两个很方便的方法来处理文件上传：

- `GetFile(key string) (multipart.File, *multipart.FileHeader, error)`：该方法主要用于用户读取表单中的文件名 `the_file`，然后返回相应的信息，用户根据这些变量来处理文件上传、过滤、保存文件等。

- `SaveToFile(fromfile, tofile string) error`：该方法是在 GetFile 的基础上实现了快速保存的功能。`fromfile`是提交时候表单中的`name`

```html
<form enctype="multipart/form-data" method="post">
  <input type="file" name="uploadname" />
  <input type="submit" />
</form>
```

保存的代码例子如下：

```go
func (c *FormController) Post() {
	f, h, err := c.GetFile("uploadname")
	if err != nil {
		log.Fatal("getfile err ", err)
	}
	defer f.Close()
	c.SaveToFile("uploadname", "static/upload/" + h.Filename) // 保存位置在 static/upload, 没有文件夹要先创建
}
```

## 文件下载

Beego 直接提供了一个下载文件的方法`Download`：

```go
func (output *BeegoOutput) Download(file string, filename ...string) {}
```

使用也很简单：

```go
func (ctrl *MainController) DownloadFile() {
	// The file LICENSE is under root path.
	// and the downloaded file name is license.txt
	ctrl.Ctx.Output.Download("LICENSE", "license.txt")
}
```

尤其要注意的是，`Download`方法的第一个参数，是文件路径，也就是要下载的文件；第二个参数是不定参数，代表的是用户保存到本地时候的文件名。

如果第一个参数使用的是相对路径，那么它代表的是从当前工作目录开始计算的相对路径。

## 相关内容

- [静态文件处理](./../view/static_file.md)
