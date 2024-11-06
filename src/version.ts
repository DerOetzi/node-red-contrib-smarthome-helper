import { readFileSync } from "fs";
import { join } from "path";

const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

export default packageJson.version;
