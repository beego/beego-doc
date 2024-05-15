---
title: Controller API
lang: en-US
---

# Controller API

The Controller, the main concept of Beego, takes on many responsibilities and can be divided into:

- [Input](../../input/README.md)
- [Output](../../output/README.md)
- Callbacks or Hooks
- [Template Render](../../view/README.md)
- Interruption
- [Session](../../session/README.md)
- [Cookie](../../cookie/README.md)
- [XSRF](./../../xsrf/README.md)

## Callbacks or Hooks

When discussing the lifecycle, two concepts should be clarified:

- The lifecycle of the entire Beego application
- The lifecycle of a single request being processed

Here we discuss the second one: the life cycle of a single request being processed.

The Controller customizes several hook functions.

- `Prepare()`: It will be called before each request is executed
- `Finish()`: It will be called after each request is executed

## Interruption

Two methods are provided inside the `Controller`.

- `(c *Controller) Abort(code string)`: This method will return the user response immediately. If the corresponding `code` developer has registered the error handling logic, then the error handling logic will be executed. If not, only an error code will be output. For how to register the handling logic, please refer to [Error Handling](../../error/README.md)
- `(c *Controller) CustomAbort(status int, body string)`: This method will output both `status` and `body` to the user. Where `status` is the HTTP response code. But if the corresponding HTTP response code already has error handling logic registered, then the `Abort` method should be used because `CustomAbort` will `panic` if the response code already has error handling logic registered.

There is also a method `StopRun` in the `Controller`. This method is more dangerous than the previous two methods because it doesn't output an error response directly to the user, but happens `panic` directly. Then if the user's `RecoverPanic` option is `true`, then the logic to recover from `recover` will be executed.

`RecoverPanic` please refer to the description in `web.Config`.
