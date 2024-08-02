---
title: XSRF
lang: en-US
---

# XSRF

[XSRF(Cross-site request forgery)](http://en.wikipedia.org/wiki/Cross-site_request_forgery), is a common security problem in web applications. The previous link also describes in detail how XSRF attacks are implemented.

A common approach to preventing XSRF today is to record an unpredictable cookie for each user and then require that all submitted requests (POST/PUT/DELETE) must have this cookie data. If this data does not match , then the request may be forged.

Beego has a built-in XSRF prevention mechanism. To use this mechanism, you need to add the `enablexsrf` setting to the application configuration file:

```
enablexsrf = true
    xsrfkey = 61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o
    xsrfexpire = 3600
```

Or:

```go
  web.EnableXSRF = true
  web.XSRFKEY = "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o"
  web.XSRFExpire = 3600  //过期时间，默认1小时
```

If XSRF is enabled, then Beego's web application will set a cookie value of `_xsrf` for all users (expires 1 hour by default), and if the `POST PUT DELET` request does not have this cookie value, then the request will be rejected outright.

Beego uses the `Secure` and `HTTP-ONLY` options to save cookies, so in most cases this means you will need to use the HTTPS protocol and will not be able to access the cookie values inside JS.

- [secure](https://en.wikipedia.org/wiki/Secure_cookie)
- [http-only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

> In the early days when these two options were not available, attackers could easily get hold of the cookie values we set, thus causing security problems. However, even if these two options are added, it does not mean that they are foolproof. For example, an attacker can try to overwrite the cookie set by the HTTP protocol with the HTTP protocol, as described in the `secure` option above.

Because Beego needs to get the Token to compare with the value in the cookie, Beego requires the user to carry the XSRF Token in their request, and you can do this in two ways.

- Carry a field called `_xsrf` in the form, which contains the XSRF Token;
- Set `X-Xsrftoken` or `X-Csrftoken` in the HTTP HEADER of the submitted request, the value is the Token;

### Form With Token

The easiest way to do this is to use Beego's method of adding a field to the form that brings back the XSRF token:

```go
func (mc *MainController) XsrfPage() {
	mc.XSRFExpire = 7200
	mc.Data["xsrfdata"] = template.HTML(mc.XSRFFormHTML())
	mc.TplName = "xsrf.html"
}
```

And `xsrf.html`:

```html
<form action="/new_message" method="post">
  {{ .xsrfdata }}
  <input type="text" name="message" />
  <input type="submit" value="Post" />
</form>
```

`.xsrfdata` is `mc.Data["xsrfdata"]` and more details refer to [Template Engine](../view/README.md)

### Page Meta

It is simpler to add the XSRF HEADER to each request by extending Ajax

Requires you to save a `_xsrf` value in the HTML

```go
func (this *HomeController) Get(){
    this.Data["xsrf_token"] = this.XSRFToken()
}
```

And use it:

```html
<head>
  <meta name="_xsrf" content="{{.xsrf_token}}" />
</head>
```

Extend the ajax method to add the `_xsrf` value to the header to support jquery post/get and other methods that use ajax internally:

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

Note that here you can replace `ajax` or `JQuery` with your own front-end framework, as the core lies in setting the header `headers, {'X-Xsrftoken':xsrftoken}`.

The `xsrftoken` can be inside an HTML tag, or it can be read directly from the previous response and brought in when the form is submitted. For example:

```go
func (mc *MainController) XsrfJSON() {
	mc.XSRFExpire = 7200
	type data struct {
		XsrfToken string `json:"xsrfToken"`
	}
	_ = mc.JSONResp(&data{XsrfToken: mc.XSRFToken()})
}
```

## Controller Skips XSRF 

XSRF was previously a globally set parameter, if set then all API requests will be validated, but there are times when the API logic does not need to be validated, so now supports setting the mask at the Controller level:

```go
type AdminController struct{
	web.Controller
}

func (a *AdminController) Prepare() {
	a.EnableXSRF = false
}
```

Refer to [Controller API Hooks - Prepare](../router/ctrl_style/controller.md)

Similarly, the expiration time is set globally as `web.XSRFExpire`, but there are times when we can modify this expiration time in the controller to specifically address a particular type of processing logic:

```go
func (this *HomeController) Get(){
	this.XSRFExpire = 7200
	// ...
}
```

## Reference

- [Controller API](../router/ctrl_style/controller.md)
- [Cookie](../cookie/README.md)
- [Template Engine](../view/README.md)
