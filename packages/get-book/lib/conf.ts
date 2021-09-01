import { Command } from 'commander';

const program = new Command();

program
  .version('2.0.0')
  .option('-u --url <string>', '读取源地址!')
  .option('-t, --title <string>', '文档中标题的选择器。', 'h1')
  .option('-a, --catalogue <string>', '章节列表选择器。', '#list a')
  .option('-c, --content <string>', '章节列表选择器。', '#content')
  .option('-m, --min-length <number>', '正文最小长度（小于这个长度将会被认为是作者的废话从而丢弃掉）。', parseInt, 200)
  .option('-l, --limit <number>', '并发请求数量。', parseInt, 5)
  .option('-s, --sleep <number>', '每个请求的间隔时间。', parseInt, 1000);
program.parse(process.argv);

export interface Conf {
  url: string,
  title: string,
  catalogue: string,
  content: string,
  minLength: number,
  limit: number,
  sleep: number
}

export default program.opts<Conf>();
