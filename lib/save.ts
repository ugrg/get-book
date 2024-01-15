import {promises} from 'fs';
import {join} from 'path';

export default async function save({title, content}: { title: string, content: string }) {
  await promises.writeFile(join(process.cwd(), `${title}.txt`), content, 'utf-8');
  console.info(`《${title}》存档完成！`);
}
