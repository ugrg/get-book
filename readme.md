#  批量下载电子书工具
这是一个针对笔趣阁类型的电子书下载工具，只要知道书目地址，即可整本下载到本地形成TXT文本。

## 参数说明
- -V, --version              获取当前版本信息!
- -u, --url <string>         读取源地址!
- -t, --title <string>       文档中标题的选择器。 (default: "h1")
- -a, --catalogue <string>   章节列表选择器。 (default: "#list a")
- -c, --content <string>     章节列表选择器。 (default: "#content")
- -m, --min-length <number>  正文最小长度（小于这个长度将会被认为是作者的废话从而丢弃掉）。 (default: 1000)
- -h, --help                 获取帮助信息!


## example
```
$ yarn start -u http://www.xbiquge.la/7/7877/
```

#update
## 2.0.0
本次更新，使用TS全部重写了这个模块。主要有以下几个改动。
1. 获取数据的包从原来的node-fetch，改成了由node自己的http.get完成，依赖库缩减。
2. 移除了进度条功能。由于经常遇到访问异常，一但报错进度就会被打破，所以移除了这个功能。
3. 由于各大厂商反爬虫策略越来越严格，所以我移除了并发功能。
4. sleep功能现在将自动计算。
5. GBK与UTF-8现在也可以自动识别了。（虽然我没测试过）

