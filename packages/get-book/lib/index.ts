import conf from './conf';
import { httpsGet as get } from './http';
import { resolve } from 'url';
import { load } from 'cheerio';
import { blue, green, yellow } from 'chalk';
import ProgressBar from 'progress';
import Arrange from './Arrange';
import save from './save';

let be = 1;
const sleep = () => new Promise(resolve => setTimeout(resolve, conf.sleep * be));

async function curl (...args: Parameters<typeof get>): Promise<string> {
  let res: string | null = null;
  while (res === null) {
    try {
      res = await get(...args);
      be = 0.9 * be;
    } catch (e) {
      console.error(`\n获取{${args[0]}}失败,error is ${e}，准备重试`);
      be = 1.5 * be;
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

// 第一阶段，获取书籍目录
async function getCatalogue () {
  console.info(JSON.stringify(conf, null, 2));
  const html = await curl(conf.url);
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
  const books = [];
  for (const i in catalogue) {
    const { index, href, title } = catalogue[i];
    const html = await curl(href, { referer: conf.url });
    bar.tick();
    const content = load(html);
    books.push({ index, title, content });
    await sleep();
  }
  return books;
}

async function main () {
  const { title, catalogue } = await getCatalogue();
  console.info(`《${green(title)}》正在下载入中：`);
  const bar = new ProgressBar(`:bar :current/:total`, { total: catalogue.length, complete: green('='), width: 100 });
  const books = await getBook(catalogue, bar);
  console.info('整本书获取完毕！');
  return {
    title,
    content: books.filter(({ content }) => content.length > conf.minLength)
      .sort(({ index: a }, { index: b }) => a - b)
      .map(({ content, title, index }) => `
## ${index + 1} ${title}
${content}
    `).join('---------------------------------------------------------------')
  };
}

main().then(Arrange).then(save).catch();
