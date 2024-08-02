---
title: Web 注册路由
lang: zh
---

# Web 注册路由

在 Beego 里面，注册路由主要有两大类风格：

1. 依赖于`web.Controller`的控制器风格注册路由。该风格要求用户显式声明一个 `Controller`，并且该控制器必须要组合`web.Controller`，参考[控制器风格注册路由](./ctrl_style/README.md)
2. 函数式风格。这种风格不需要你定义任何的`Controller`，只需要声明一个函数，该函数的入参是`web.Context`，具体细节参考[函数式风格注册路由](./functional_style/README.md)

那么，不知道自己应该使用哪种风格吗？你可以参考我们的这些[最佳实践](best_practice.md)建议
