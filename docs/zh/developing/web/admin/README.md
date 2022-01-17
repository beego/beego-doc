---
title: Admin管理后台
lang: zh
---

# Admin 管理后台

默认 Admin 是关闭的，你可以通过配置开启监控：

```go
web.BConfig.Listen.EnableAdmin = true
```

而且你还可以修改监听的地址和端口：

```go
web.BConfig.Listen.AdminAddr = "localhost"
web.BConfig.Listen.AdminPort = 8088
```

打开浏览器，输入 URL：`http://localhost:8088/`，你会看到一句欢迎词：`Welcome to Admin Dashboard`。

## 请求统计信息

访问统计的 URL 地址 `http://localhost:8088/qps`，展现如下所示：

![](../images/monitoring.png)

## 性能调试

你可以查看程序性能相关的信息, 进行性能调优.

## 健康检查

需要手工注册相应的健康检查逻辑，才能通过 URL`http://localhost:8088/healthcheck` 获取当前执行的健康检查的状态。

## 定时任务

用户需要在应用中添加了 [定时任务](../../task/README.md)，才能执行相应的任务检查和手工触发任务。

- 检查任务状态 URL：`http://localhost:8088/task`
- 手工执行任务 URL：`http://localhost:8088/task?taskname=任务名`

## 配置信息

应用开发完毕之后，我们可能需要知道在运行的进程到底是怎么样的配置，beego 的监控模块提供了这一功能。

- 显示所有的配置信息: `http://localhost:8088/listconf?command=conf`
- 显示所有的路由配置信息:  `http://localhost:8088/listconf?command=router`
- 显示所有的过滤设置信息:  `http://localhost:8088/listconf?command=filter`
