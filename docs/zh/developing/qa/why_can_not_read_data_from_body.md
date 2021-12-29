---
title: 为什么无法读取 HTTP Body 的内容
lang: zh
---

# 为什么无法读取 HTTP Body 的内容

目前来看，主要有两种可能：
- 没有将`CopyRequestBody`设置为 true，参考[`CopyRequestBody`参数](what-is-copy-request-body.md)；
- 已经有别的 Filter, middlerware 读完了 Body：这个原因可能有些用户不太清楚。在默认的情况下，`http`里面的`Request`设计成了流结构，因此里面的数据只能读取一次。大多数时候，如果想要反复读取，就要自己将这个请求体复制一份出来；