---
title: XSRF
lang: zh
---

# 跨站请求伪造

[跨站请求伪造(Cross-site request forgery)](http://en.wikipedia.org/wiki/Cross-site_request_forgery)， 简称为 XSRF，是 Web 应用中常见的一个安全问题。前面的链接也详细讲述了 XSRF 攻击的实现方式。

当前防范 XSRF 的一种通用的方法，是对每一个用户都记录一个无法预知的 cookie 数据，然后要求所有提交的请求（POST/PUT/DELETE）中都必须带有这个 cookie 数据。如果此数据不匹配 ，那么这个请求就可能是被伪造的。

Beego 有内建的 XSRF 的防范机制，要使用此机制，你需要在应用配置文件中加上 `enablexsrf` 设定：

```
enablexsrf = true
    xsrfkey = 61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o
    xsrfexpire = 3600
```

或者直接在 main 入口处这样设置：

```go
  web.EnableXSRF = true
  web.XSRFKEY = "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o"
  web.XSRFExpire = 3600  //过期时间，默认1小时
```

如果开启了 XSRF，那么 Beego 的 Web 应用将对所有用户设置一个 `_xsrf` 的 Cookie 值（默认过期 1 小时），如果 `POST PUT DELET` 请求中没有这个 Cookie 值，那么这个请求会被直接拒绝。

Beego 使用了 `Secure` 和 `HTTP-ONLY` 两个选项来保存 Cookie。因此在大部分情况下，这意味这你需要使用 HTTPS 协议，并且将无法在 JS 里面访问到 Cookie 的值。

- [secure](https://en.wikipedia.org/wiki/Secure_cookie)
- [http-only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

> 在早期缺乏这两个选项的时候，攻击者可以轻易拿到我们设置的 Cookie 值，因此造成了安全问题。但是即便加上这两个选项，也不意味着万无一失。比如说，攻击者可以尝试用 HTTP 协议覆盖掉原有的 HTTP 协议设置的 Cookie。具体细节可以参考前面 `secure` 选项中的说明。

因为 Beego 需要拿到 Token 和 Cookie 里面的值进行比较，所以 Beego 要求用户必须在自己的请求里面带上 XSRF Token，你有两种方式：

- 在表单里面携带一个叫做 `_xsrf` 的字段，里面是 XSRF 的 Token;
- 在提交的请求的 HTTP HEADER 里面设置 `X-Xsrftoken` 或 `X-Csrftoken`，值就是 Token;

下面是使用这两种方式的简单例子

### 表单中携带 Token

最简单的做法，是利用 Beego 的方法，在表单中加入一个字段，将 XSRF Token 带回来，例如：

```go
func (mc *MainController) XsrfPage() {
	mc.XSRFExpire = 7200
	mc.Data["xsrfdata"] = template.HTML(mc.XSRFFormHTML())
	mc.TplName = "xsrf.html"
}
```

其中`xsrf.html`的核心代码是：

```html
<form action="/new_message" method="post">
  {{ .xsrfdata }}
  <input type="text" name="message" />
  <input type="submit" value="Post" />
</form>
```

`.xsrfdata`就是`mc.Data["xsrfdata"]`，详情可以参考[模板引擎](../view/README.md)

### 页面设置 meta

比较简单的是通过扩展 Ajax 给每个请求加入 XSRF 的 HEADER

需要你在 HTML 里保存一个 `_xsrf` 值

```go
func (this *HomeController) Get(){
    this.Data["xsrf_token"] = this.XSRFToken()
}
```

放在你的页面 HEAD 中

```html
<head>
  <meta name="_xsrf" content="{{.xsrf_token}}" />
</head>
```

扩展 ajax 方法，将 `_xsrf` 值加入 header，扩展后支持 jquery post/get 等内部使用了 ajax 的方法

```js
var ajax = $.ajax;
$.extend({
  ajax: function (url, options) {
    if (typeof url === "object") {
      options = url;
      url = undefined;
    }
    options = options || {};
    url = options.url;
    var xsrftoken = $("meta[name=_xsrf]").attr("content");
    var headers = options.headers || {};
    var domain = document.domain.replace(/\./gi, "\\.");
    if (
      !/^(http:|https:).*/.test(url) ||
      eval("/^(http:|https:)\\/\\/(.+\\.)*" + domain + ".*/").test(url)
    ) {
      headers = $.extend(headers, { "X-Xsrftoken": xsrftoken });
    }
    options.headers = headers;
    return ajax(url, options);
  },
});
```

注意的是，这里你可以将`ajax`或者`JQuery`替换为你自己的前端框架，因为核心在于要设置头部`headers, {'X-Xsrftoken':xsrftoken}`。

而这个`xsrftoken`可以是存在 HTML 的一个标签里面，也可是直接从之前响应里面读取出来，而后再提交表单的时候带过来。例如：

```go
func (mc *MainController) XsrfJSON() {
	mc.XSRFExpire = 7200
	type data struct {
		XsrfToken string `json:"xsrfToken"`
	}
    // 提交请求的时候用前端 JS 操作将这个 xsrfToken 再次带回来
	_ = mc.JSONResp(&data{XsrfToken: mc.XSRFToken()})
}
```

## Controller 级别的 XSRF 屏蔽

XSRF 之前是全局设置的一个参数,如果设置了那么所有的 API 请求都会进行验证,但是有些时候 API 逻辑是不需要进行验证的,因此现在支持在 Controller 级别设置屏蔽:

```go
type AdminController struct{
	web.Controller
}

func (a *AdminController) Prepare() {
	a.EnableXSRF = false
}
```

其中`Prepare`方法是 Controller 的一个钩子方法，详情参考[Controller API-钩子方法](../router/ctrl_style/controller.md)

同样地，过期时间上面我们设置了全局的过期时间 `web.XSRFExpire`，但是有些时候我们也可以在控制器中修改这个过期时间，专门针对某一类处理逻辑：

```go
func (this *HomeController) Get(){
	this.XSRFExpire = 7200
	// ...
}
```

## 相关内容

- [Controller API](../router/ctrl_style/controller.md)
- [Cookie](../cookie/README.md)
- [模板引擎](../view/README.md)
