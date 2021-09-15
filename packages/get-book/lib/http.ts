import { request, Agent, RequestOptions } from 'https';
import { gunzipSync } from 'zlib';
import { decode } from 'iconv-lite';
import { IncomingMessage } from 'http';

const agent = new Agent();

const defHeaders: RequestOptions['headers'] = {
  Connection: 'keep-alive',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
  'Accept-Encoding': 'gzip, deflate',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 Edg/93.0.961.47',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin'
};

export const httpsGet = (url: string, headers?: RequestOptions['headers']): Promise<string> => {
  return new Promise<Buffer>((resolve, reject) => {
    const responseHandler = (res: IncomingMessage) => {
      // console.info(`\n get ${url} start, the status is ${res.statusCode}`);
      if (res.statusCode! >= 300) return reject(res.statusCode);
      const buffers: Buffer[] = [];
      res.on('data', (chunk) => buffers.push(chunk));
      res.on('end', () => {
        // console.debug(`\n get ${url} end,buffer length = ${buffers.length}`);
        let buffer = Buffer.concat(buffers);
        if (res.headers['content-encoding'] === 'gzip') buffer = gunzipSync(buffer);
        resolve(buffer);
      });
    };

    const client = request(url, {
      method: 'GET', agent,
      headers: Object.assign(defHeaders, headers)
    }, responseHandler);
    client.on('error', reject);
    client.end();
  }).then((buffer) => {
    let result = buffer.toString();
    if (/charset=gbk/.test(result)) result = decode(buffer, 'gbk');
    return result;
  });
};
