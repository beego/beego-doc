---
title: Controller 主要 API
lang: zh
---

# Controller API

Controller 作为 Beego 的主要概念，它承担了很多的职责，可以分成：
- [输入处理](../input/README.md)
- [输出处理](../output/README.md)
- 请求生命周期回调或者说钩子函数
- [页面渲染，或者说模板引擎](../view/README.md)
- 中断执行
- [Session 处理](../../session/README.md)
- [Cookie 处理](../../cookie/README.md)
- [XSRF](./../../xsrf/README.md)

## 请求生命周期回调

在讨论生命周期的时候，要澄清两个概念：
- 整个 Beego 应用的生命周期
- 单个请求被处理的生命周期

这里我们讨论的是第二个：单个请求被处理的生命周期。

Controller 自定义了几个钩子函数：

- `Prepare()`: 它会在每一个请求执行之前调用一遍
- `Finish()`: 它会在每一个请求执行之后调用一遍


## 中断执行

在 `Controller` 里面提供了两个方法：
- `(c *Controller) Abort(code string)`: 该方法会立刻返回用户响应。如果对应的`code`开发者已经注册了错误处理的逻辑，那么就会回调错误处理逻辑。如果没有则只会输出一个错误码。如何注册处理逻辑，请参考[错误处理](../../error/README.md)
- `(c *Controller) CustomAbort(status int, body string)`: 这个方法会同时输出`status`和`body`给用户。其中`status`就是 HTTP 响应码。但是如果对应的 HTTP 响应码已经注册了错误处理逻辑，那么应该使用`Abort`方法因此`CustomAbort`会在响应码已经注册了错误处理逻辑的情况下发生`panic`；

此外在`Controller`中还有一个方法`StopRun`。这个方法相比前面两个方法，较为危险，因为它并不是直接输出错误响应给用户，而是直接发生`panic`。那么如果用户的`RecoverPanic`选项为`true`，那么就会执行从`recover`之中恢复的逻辑。

`RecoverPanic`请参考`web.Config`中的说明。


