#!/usr/bin/env node
import {blue, green, red, yellow} from 'chalk';
import {load} from 'cheerio';
import {existsSync, promises} from 'fs';
import {join} from 'path';
import {resolve} from 'url';
import Arrange from './Arrange';
import conf from './conf';
import curl from './curl';
import save from './save';

interface Chapter {
  index: number,
  href: string,
  title: string
}

// 第一阶段，获取书籍目录
async function getCatalogue() {
  const html = await curl(conf.url);
  const $ = load(html);
  const title = $(conf.title).text();
  const cache = new Set<string>();
  const catalogue: Chapter[] = Array.from($(conf.catalogue).map((index: number, a) => {
    const $a = $(a);
    const href = resolve(conf.url, $a.attr('href')!);
    return {index, href, title: $a.text()};
  })).reverse().filter(({href}) => {
    if (cache.has(href)) return false;
    cache.add(href);
    return true;
  }).reverse();
  console.info(`已完成对${blue(conf.url)}的加载！`);
  console.info(`获得书本《${yellow(title)}》，共${green(catalogue.length)}章！`);
  return {title, catalogue};
}

const delayStr = (start: number, n: number, count: number) => {
  let delay = Math.floor((new Date().valueOf() - start.valueOf()) * (count - n) / (n * 1000));
  const ss = delay % 60;
  delay = (delay - ss) / 60;
  const mm = delay % 60;
  delay = (delay - mm) / 60;
  const hh = delay % 24;
  delay = (delay - hh) / 24;
  const dd = delay / 24;
  return [[dd, '天'], [hh, '小时'], [mm, '分'], [ss, '秒']].filter(([r]) => r).reduce<string>(
    (res, [p, d]) => res + p + d, ''
  );
};
const TEMP = process.env.TEMP!;

async function getBook(catalogue: Chapter[], bookTitle: string) {
  const books = [];
  const start = new Date().valueOf();
  let cache = 0;
  await promises.mkdir(join(TEMP, bookTitle)).catch(() => null);
  for (let i = 1; i <= catalogue.length; i++) {
    const {index, href, title} = catalogue[i - 1];
    const cacheFileName = join(TEMP, bookTitle, `${title}.html`).replace(/[\n\t]/g, '');
    let html = '';
    try {
      if (!existsSync(cacheFileName)) {
        html = await curl(href, {referer: conf.url});
        await promises.writeFile(cacheFileName, html, 'utf-8');
      } else {
        html = await promises.readFile(cacheFileName, 'utf-8');
        cache++;
      }
      const content = Array.from(load(html.replace(/<br\/>/g, '\n'))(`${conf.content} p`))
        .map((p) => load(p).text()).join('\n');
      console.info(`第${i}章《${blue(title)}》下载入完成, 本章共${green(content.length)}字，预计还需要${
        green(delayStr(start, i - 1 - cache, catalogue.length - cache))
      }完成。`);
      books.push({index, title, content});
    } catch (e) {
      console.info(`第${i}章 ${title} 获取失败, 计划等待${red((e as unknown as number).toString().slice(0, 4))}s后重试`);
      i--;
    }
  }
  return books;
}

async function main() {
  const {title, catalogue} = await getCatalogue();
  console.info(`《${green(title)}》正在下载入中：`);
  const books = await getBook(catalogue, title);
  console.info('整本书获取完毕！');
  return {
    title,
    content: books.filter(({content}) => content.length > conf.minLength)
      .sort(({index: a}, {index: b}) => a - b)
      .map(({content, title, index}) => `
## ${index + 1} ${title}
${content}
    `).join('---------------------------------------------------------------')
  };
}

main().then(Arrange).then(save).catch(() => null);
