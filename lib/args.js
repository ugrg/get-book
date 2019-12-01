const commander = require("commander");
const _package = require("../package");
const parse = (value) => parseInt(value);
const program = new commander.Command();
program.version(_package.version, undefined, "获取当前版本信息!");
program.helpOption(undefined, "获取帮助信息!");

program.option("-u, --url <string>", "读取源地址!");
program.option("-t, --title <string>", "文档中标题的选择器。", "h1");
program.option("-a, --catalogue <string>", "章节列表选择器。", "#list a");
program.option("-c, --content <string>", "章节列表选择器。", "#content");
program.option("-l, --limit <number>", "并发请求数量。", parse, 5);
program.option("-s, --sleep <number>", "每个请求的间隔时间。", parse, 1000);
program.option("-m, --min-length <number>", "正文最小长度（小于这个长度将会被认为是作者的废话从而丢弃掉）。", parse, 200);
program.option("-g, --gbk", "标记源地址是否为GBK编码");

program.parse(process.argv);

/**
 * @type {{
 *   url:String,
 *   title:String,
 *   catalogue:String,
 *   content:String,
 *   limit:Number,
 *   sleep:Number,
 *   minLength:Number,
 *   gbk:Boolean
 * }}
 */
module.exports = program.opts();
