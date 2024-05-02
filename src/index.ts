import * as fs from "node:fs";

import { commands } from "./command";
import { compile } from "./compile";
import { logger } from "./logger";

export const tscc = () => {
  const files = commands();

  logger.title(`Compiling: ${files[0]}\n`);
  const ts = fs.readFileSync(files[0], "utf8");
  const [_tree, errors, js] = compile(ts);

  if (errors.length) {
    logger.title("> Errors:");
    logger.log(errors);
  }
  logger.title("Complete..");

  fs.writeFileSync(files[0].replace(".ts", ".js"), js);
};

tscc();
