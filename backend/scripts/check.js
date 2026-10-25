const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
}
walk(src);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    console.error(`FAIL ${path.relative(root, file)}\n${result.stderr}`);
  } else {
    console.log(`OK   ${path.relative(root, file)}`);
  }
}
if (failed) process.exit(1);
console.log(`\nSyntax check passed for ${files.length} JavaScript files.`);
