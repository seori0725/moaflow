const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "firebase-public");
const assets = ["index.html", "app.js", "qa-data.js", "styles.css"];

if (path.dirname(output) !== root) {
  throw new Error("Firebase 배포 폴더가 프로젝트 밖으로 지정됐습니다.");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);

for (const asset of assets) {
  fs.copyFileSync(path.join(root, asset), path.join(output, asset));
}
