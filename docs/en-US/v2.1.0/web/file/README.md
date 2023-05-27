---
title: File Download Upload
lang: en-US
---

# File Download Upload

## Upload

You can easily handle file uploads in Beego, just don't forget to add this attribute `enctype="multipart/form-data"` to your form, otherwise your browser won't transfer your uploaded file.

If the file size is larger than the set cache memory size, then it will be placed in a temporary file, the default cache memory is 64M, you can adjust this cache memory size by following:

```
web.MaxMemory = 1<<22
```

Or in configuration files:

```
maxmemory = 1<<22
```

At the same time, Beego provides another parameter, `MaxUploadSize`, to limit the maximum upload file size - if you upload multiple files at once, then it limits the size of all those files combined together.

By default, `MaxMemory` should be set smaller than `MaxUploadSize`, and the effect of combining the two parameters in this case is:

1. if the file size is smaller than `MaxMemory`, it will be processed directly in memory.
2. if the file size is between `MaxMemory` and `MaxUploadSize`, the portion larger than `MaxMemory` will be placed in a temporary directory.
3. the file size exceeds `MaxUploadSize`, the request is rejected directly and the response code is returned 413

Beego provides two very convenient ways to handle file uploads:

- `GetFile(key string) (multipart.File, *multipart.FileHeader, error)`

- `SaveToFile(fromfile, tofile string) error`

```html
<form enctype="multipart/form-data" method="post">
  <input type="file" name="uploadname" />
  <input type="submit" />
</form>
```
Saving file example:

```go
func (c *FormController) Post() {
	f, h, err := c.GetFile("uploadname")
	if err != nil {
		log.Fatal("getfile err ", err)
	}
	defer f.Close()
	c.SaveToFile("uploadname", "static/upload/" + h.Filename) 
}
```

## Download

```go
func (output *BeegoOutput) Download(file string, filename ...string) {}
```

Example:

```go
func (ctrl *MainController) DownloadFile() {
	// The file LICENSE is under root path.
	// and the downloaded file name is license.txt
	ctrl.Ctx.Output.Download("LICENSE", "license.txt")
}
```
In particular, note that the first parameter of the `Download` method is the file path, that is, the file to be downloaded; the second parameter is an indefinite parameter, representing the file name when the user saves it locally.

If the first parameter uses a relative path, then it represents a relative path calculated from the current working directory.

## Reference

- [Static files](./../view/static_file.md)
