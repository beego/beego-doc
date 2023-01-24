---
title: hy did the web server fail to start?
lang: en-US
---

## hy did the web server fail to start?

The reasons for web server startup can be varied. Generally speaking, it fails because there is a problem with the local environment. web server startup failure generally consists of two parts.

1. Application service failed to start
2. Admin service failed to start

However, they fail for similar reasons because essentially, the admin service is one of our built-in services.

### Port conflict

This is the most common reason for service startup failure. By default, the application service port is 8080, while the admin service port is 8088.

So we have to check the port situation first. You can run the command:

```shell
lsof -i:8080
```

`8080` can be replaced with your port, including the admin service port.

If you find that process information is already output, e.g.:

```shell
COMMAND      PID    USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
___go_bui 160824    xxxx    3u  IPv6 82721234      0t0  TCP *:9090 (LISTEN)
```

Then it means that the port is occupied. In this case, you need to consider closing this process.

First you need to make sure that the process is closeable. As we have observed, in most cases it is possible to close the process directly by typing in the command line.

```shell
kill -9 160824
```

`160824` is the PID, which is the process ID, please replace it by yourself.

And then restart the services.
