import conf from './conf';
import { get } from './http';
import { URL, resolve } from 'url';
import { load } from 'cheerio';
import { blue, green, yellow } from 'chalk';
import Pool from './Pool';
import ProgressBar from 'progress';

const sleep = () => new Promise(resolve => setTimeout(resolve, conf.sleep));

async function curl (...args: Parameters<typeof get>): Promise<string> {
  let res: string | null = null;
  while (res === null) {
    try {
      res = await get(...args);
    } catch (e) {
      await sleep();
    }
  }
  return res;
}

interface Chapter {
  index: number,
  href: string,
  title: string
}

const { host, protocol } = new URL(conf.url);

// 第一阶段，获取书籍目录
async function getCatalogue () {
  const html = await curl(conf.url, { Host: host });
  const $ = load(html);
  const title = $(conf.title).text();
  const catalogue: Chapter[] = Array.from($(conf.catalogue).map((index, a) => {
    const $a = $(a);
    const href = resolve(conf.url, $a.attr('href')!);
    return { index, href, title: $a.text() };
  }));
  console.info(`已完成对${blue(conf.url)}的加载！`);
  console.info(`获得书本《${yellow(title)}》，共${green(catalogue.length)}章！`);
  return { title, catalogue };
}

async function getBook (catalogue: Chapter[], bar: ProgressBar) {
  const pool = new Pool(conf.limit, conf.sleep);
  const books = catalogue.map(async ({ index, href, title }) => {
    const html = await pool.add(
      () => curl(href, { referer: conf.url, Host: host })
    ).finally(() => bar.tick());
    const content = load(html);
    return { index, title, content };
  });
  return Promise.all(books);
}

async function main () {
  const { title, catalogue } = await getCatalogue();
  console.info(`《${green(title)}》正在下载入中：`);
  const bar = new ProgressBar(`:bar :current/:total`, { total: catalogue.length, complete: green('='), width: 100 });
  const books = await getBook(catalogue, bar);
  console.info('整本书获取完毕！');
  books.filter(({ content }) => content.length > conf.minLength)
    .sort(({ index: a }, { index: b }) => a - b);
}

main().catch();
