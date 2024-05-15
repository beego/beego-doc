---
title: Why can't I read the contents of the HTTP body?
lang: en-US
---

# Why can't I read the contents of the HTTP body?

- `CopyRequestBody=false`, refer [`CopyRequestBody`参数](what-is-copy-request-body.md)；
- There are already other Filter, Middleware read out body: By default, the `Request` inside `http` is designed as a stream structure, so the data inside can only be read once. Most of the time, if you want to read it repeatedly, you have to make a copy of this request body yourself；
