import get from './http';

let be = 1;
const sleep = () => new Promise(resolve => setTimeout(resolve, 1000 * be));

async function curl (...args: Parameters<typeof get>): Promise<string> {
  try {
    await sleep();
    const res = await get(...args);
    be = 0.9 * be;
    return res;
  } catch (e) {
    be = 1.25 * be;
    throw be;
  }
}

export default curl;
