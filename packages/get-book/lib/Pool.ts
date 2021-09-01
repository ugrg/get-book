class Pool {
  private readonly pool: Promise<any>[];
  private readonly ms: number;
  private p: number;

  constructor (limit: number, sleep: number = 0) {
    this.pool = Array(limit).fill(0).map(() => Promise.resolve());
    this.ms = sleep;
    this.p = 0;
  }

  private get px () {
    return this.pool[this.p];
  };

  async add<R> (task: () => Promise<R>): Promise<R> {
    this.p = (this.p + 1) % this.pool.length;
    await this.pool[this.p].catch(() => void (0));
    await new Promise(resolve => setTimeout(resolve, this.ms));
    return this.pool[this.p] = task();
  }
}

export default Pool;
