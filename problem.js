const fs = require("fs");
const crypto = require("crypto");
const HASH = (str) => crypto.createHash("sha256").update(str).digest("hex");
const hashSet = new Set();

const readline = require("readline");
const rl = readline.createInterface({
  input: fs.createReadStream("./book/科技炼器师.txt"),
  crlfDelay: Infinity
});
let p = 0;
let line = 0;
let mp = 0;
rl.on("line", (str) => {
  line++;
  const hash = HASH(str);
  if (hashSet.has(hash)) p++;
  else {
    hashSet.add(hash);
    p = 0;
  }
  if (p === 5) console.info("problem:", ++mp, line);
});
let lastLine = -1;

const timer = setInterval(() => {
  if (line === lastLine) clearInterval(timer);
  console.info("readline:", line);
  lastLine = line;
}, 1000);


