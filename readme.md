#  批量下载电子书工具
这是一个针对笔趣阁类型的电子书下载工具，只要知道书目地址，即可整本下载到本地形成TXT文本。
需要注意的是，这个工具只对UTF-8类型的网页有效，如果是GBK类型的，还需要加装一个编码转换器。

## 参数说明
- -V, --version              获取当前版本信息!
- -u, --url <string>         读取源地址!
- -t, --title <string>       文档中标题的选择器。 (default: "h1")
- -a, --catalogue <string>   章节列表选择器。 (default: "#list a")
- -c, --content <string>     章节列表选择器。 (default: "#content")
- -l, --limit <number>       并发请求数量。 (default: 5)
- -s, --sleep <number>       每个请求的间隔时间。 (default: 1000)
- -m, --min-length <number>  正文最小长度（小于这个长度将会被认为是作者的废话从而丢弃掉）。 (default: 1000)
- --gbk                      源地址是否为GBK
- -h, --help                 获取帮助信息!


## example
```
$ yarn start -u http://www.xbiquge.la/7/7877/
```