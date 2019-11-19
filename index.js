const url = require("url");
const fs = require("fs");
const fetch = require("node-fetch").default;
const cheerio = require("cheerio");
const ProgressBar = require("progress");
const { decode } = require("iconv-lite");
const Pool = require("./lib/Pool");
const { red, green, yellow, blue } = require("colors");
const args = require("./lib/args");
const randomIp = require("./lib/randomIP");
const { clear, replace } = require("./config");

// 无限重试
const retry = (fn, ...args) => fn(...args)
  .catch(() => new Promise((resolve, reject) => setTimeout(reject, args.sleep)))
  .catch(() => retry(fn, ...args));

// 获取URL内容
const curl = (url) => Promise.race([
  new Promise((resolve, reject) => setTimeout(reject, 5000)),
  fetch(url, {
    method: "GET",
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4",
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36",
      "x-forwarded-for": randomIp()
    }
  })
]).then((res) => {
  if (res.status !== 200) {
    console.info(`[${red(res.status)}]:${blue(url)}请求失败！`);
    throw res;
  }
  return res.arrayBuffer();
}).then((buffer) => {
  buffer = Buffer.from(buffer);
  return args.gbk ? decode(buffer, "gbk") : buffer.toString();
});

// 第一阶段，获取书籍目录
curl(args.url)
  .then(html => {
    const $ = cheerio.load(html);
    const title = $(args.title).text();
    const catalogue = $(args.catalogue).map((index, a) => {
      a = $(a);
      return {
        index,
        href: url.resolve(args.url, $(a).attr("href")),
        title: $(a).text()
      };
    });
    console.info(`已完成对${blue(args.url)}的加载！`);
    console.info(`获得书本《${yellow(title)}》，共${green(catalogue.length)}章！`);
    return { title, catalogue: Array.from(catalogue) };
  })
  // 第二阶段，下载所有章节
  .then(({ title, catalogue }) => {
    const pool = new Pool(args.limit, args.sleep);
    console.info(`《${green(title)}》正在下载入中：`);
    const bar = new ProgressBar(`:bar :current/:total`, { total: catalogue.length, complete: green("=") });
    const books = catalogue.map(({ index, href, title }) =>
      pool.add(() => retry(curl, href)).finally(() => bar.tick())
        .then(html => ({ index, href, title, content: cheerio.load(html)(args.content).text() })));
    return Promise.all(books).then((books) => ({ title, books }));
  })
  // 第三阶段，聚合内容
  .then(({ title, books }) => {
    console.info("整本书获取完毕！");
    books = books.filter(({ content }) => content.length > args.minLength).sort(({ index: a }, { index: b }) => a - b).map(({ index, href, title, content }) => {
      return `
## ${index + 1} ${title}
${content}
`;
    }).join("----------------------------------------------------------------");
    books = clear.reduce((c, reg) => c.replace(reg, ""), books);
    books = Object.entries(replace).reduce((book, [f, t]) => book.replace(f, t), books);
    console.info(`《${title}》整理完成，共${books.length}字`);
    return { title, books };
  })
  //  第四阶段，输出到磁盘
  .then(({ title, books }) => {
    fs.writeFile(`./book/${title}.txt`, books, "utf-8", (err) => {
      if (err) return console.info(err.message);
      console.info(`《${title}》存档完成！`);
    });
  });