import {Agent as HttpAgent, get as httpGet, IncomingMessage, RequestOptions} from 'http';
import {Agent as HttpsAgent, get as httpsGet} from 'https';
import {decode} from 'iconv-lite';
import {gunzipSync, brotliDecompressSync} from 'zlib';

const randomIp = () => Array(4).fill(0).map(() => Math.floor(Math.random() * 255) + 1).join('.');
const IPLine = () => Array(Math.floor(Math.random() * Math.random() * 4)).fill(0).map(randomIp).join(', ');
const handles = {
  'http:': {get: httpGet, agent: new HttpAgent()},
  'https:': {get: httpsGet, agent: new HttpsAgent()}
};

const defHeaders: RequestOptions['headers'] = {
  connection: 'keep-alive',
  'cache-control': 'max-age=0',
  'sec-ch-ua': 'Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-user': '?1',
  'sec-fetch-dest': 'document',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
};

export default (url: string, headers?: RequestOptions['headers']): Promise<string> => {
  const {protocol, host} = new URL(url);
  const {get, agent} = handles[protocol as keyof typeof handles];
  return new Promise<Buffer>((resolve, reject) => {
    const responseHandler = (res: IncomingMessage) => {
      if ((res.statusCode ?? 500) >= 300) return reject(res.statusCode);
      const buffers: Buffer[] = [];
      res.on('data', (chunk) => buffers.push(chunk));
      res.on('end', () => {
        let buffer = Buffer.concat(buffers);
        if (res.headers['content-encoding'] === 'gzip') buffer = gunzipSync(buffer);
        if (res.headers['content-encoding'] === 'br') buffer = brotliDecompressSync(buffer);
        resolve(buffer);
      });
    };
    const client = get(url, {
      agent, headers: Object.assign({host, 'x-forwarded-for': IPLine()}, defHeaders, headers)
    }, responseHandler);
    client.on('error', reject);
  }).then((buffer) => {
    let result = buffer.toString();
    if (/charset=gbk/.test(result)) result = decode(buffer, 'gbk');
    return result;
  });
};
