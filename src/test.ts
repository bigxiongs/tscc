import { compile } from "./compile";
import { logger } from "./logger";

const ts = `
let abc: number = 1;
abc = abc + 1;
abc = abc * 2;
const obj: { a: number, b: number } = {
  a: 1,
  b: 2,
};
`
const [_tree, errors, js] = compile(ts);

if (errors.length) {
  logger.title("> Errors:");
  logger.log(errors);
}
logger.title("Complete..");


