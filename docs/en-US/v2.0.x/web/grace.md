---
title: Web 热升级
lang: zh
---

# 热升级

热升级是什么呢？了解 nginx 的同学都知道，nginx 是支持热升级的，可以用老进程服务先前链接的链接，使用新进程服务新的链接，即在不停止服务的情况下完成系统的升级与运行参数修改。那么热升级和热编译是不同的概念，热编译是通过监控文件的变化重新编译，然后重启进程，例如 `bee run` 就是这样的工具

Beego 主要的思路来源于： http://grisha.org/blog/2014/06/03/graceful-restart-in-golang/

```go
 import(
   "log"
	"net/http"
	"os"
    "strconv"

   "github.com/beego/beego/v2/server/web/grace"
 )

  func handler(w http.ResponseWriter, r *http.Request) {
	  w.Write([]byte("WORLD!"))
      w.Write([]byte("ospid:" + strconv.Itoa(os.Getpid())))
  }

  func main() {
      mux := http.NewServeMux()
      mux.HandleFunc("/hello", handler)

      err := grace.ListenAndServe("localhost:8080", mux)
      if err != nil {
		   log.Println(err)
	    }
      log.Println("Server on 8080 stopped")
	     os.Exit(0)
    }
```

打开两个终端

一个终端输入：`ps -ef|grep 应用名`

一个终端输入请求：`curl "http://127.0.0.1:8080/hello"`

热升级

kill -HUP 进程 ID

打开一个终端输入请求：`curl "http://127.0.0.1:8080/hello?sleep=0"`
