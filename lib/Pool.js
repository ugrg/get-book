class Pool {
  constructor (limit, sleep = 0) {
    this.pool = Array(parseInt(limit)).fill(0).map(() => Promise.resolve());
    this.sleep = sleep;
    this.p = 0;
  }

  add (task) {
    const p = (this.p + 1) % this.pool.length;
    this.p = p;
    return this.pool[p] = this.pool[p].catch(() => null)
      .then(() => new Promise((resolve) => setTimeout(resolve, this.sleep)))
      .then(task);
  }
}

module.exports = Pool;