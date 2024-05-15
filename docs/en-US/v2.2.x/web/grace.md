---
title: Web Hot Upgrade
lang: en-US
---

# 热升级

What is a hot upgrade? If you know about nginx, you know that it supports hot upgrades, where you can use old processes to serve previously linked links and new processes to serve new links, i.e., you can upgrade the system and modify the operating parameters without stopping the service.

The main idea of Beego comes from: http://grisha.org/blog/2014/06/03/graceful-restart-in-golang/

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

Open two terminals:

One input: `ps -ef|grep 应用名`

One input: `curl "http://127.0.0.1:8080/hello"`

And then 

`kill -HUP ${procces ID}`

Open other terminal, input: `curl "http://127.0.0.1:8080/hello?sleep=0"`
