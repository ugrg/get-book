import { request, Agent, RequestOptions, IncomingMessage } from 'http';
import { gunzipSync } from 'zlib';
import { decode } from 'iconv-lite';

const agent = new Agent({ maxSockets: 5 });

const defHeaders: RequestOptions['headers'] = {
  Connection: 'keep-alive',
  Accept: 'text/html',
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
  'Accept-Encoding': 'gzip, deflate',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84',
  'Upgrade-Insecure-Requests': 1
};

export const get = (url: string, headers?: RequestOptions['headers']): Promise<string> => {
  return new Promise<Buffer>((resolve, reject) => {
    const responseHandler = (res: IncomingMessage) => {
      if (res.statusCode! >= 300) reject('响应异常，准备重试');
      const buffers: Buffer[] = [];
      res.on('data', (chunk) => buffers.push(chunk));
      res.on('end', () => {
        let buffer = Buffer.concat(buffers);
        if (res.headers['content-encoding'] === 'gzip') buffer = gunzipSync(buffer);
        resolve(buffer);
      });
    };
    const client = request(url, { agent, headers: Object.assign(defHeaders, headers), method: 'GET' }, responseHandler);
    client.on('error', reject);
  }).then((buffer) => {
    let result = buffer.toString();
    if (/charset=gbk/.test(result)) result = decode(buffer, 'gbk');
    return result;
  });
};
