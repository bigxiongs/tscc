import * as fs from "node:fs";

import { commands } from "./command";
import { compile } from "./compile";
import { logger } from "./logger";
import { lex } from "./lex";
import { Token } from "./token";
import { parse } from "./parse";
import { errors } from "./error";

export const tscc = () => {
  const [files, l, p] = commands();
  if (l) {
    (files as string[]).forEach((f) => {
      logger.title(`Lexing: ${f}\n`);
      const ts = fs.readFileSync(f, "utf8");
      const lexer = lex(ts);
      while (lexer.token != Token.EOF) {
        logger.dumpToken(lexer.token, lexer.lexeme, lexer.pos);
        lexer.next();
      }
      logger.dumpToken(lexer.token, lexer.lexeme, lexer.pos);
      logger.title("Complete..");
    });
  } else if (p) {
    (files as string[]).forEach((f) => {
      logger.title(`Parsing: ${f}\n`);
      const ts = fs.readFileSync(f, "utf8");
      const lexer = lex(ts);
      const tree = parse(lexer)
      logger.dumpAst(tree)
      if (errors.size) {
        logger.title("> Errors:");
        logger.log(Array.from(errors.values()));
      }
      logger.title("Complete..");
    });
  } else {
    (files as string[]).forEach((f) => {
      logger.title(`Compiling: ${f}\n`);
      const ts = fs.readFileSync(f, "utf8");
      const [_tree, errors, js] = compile(ts);

      if (errors.length) {
        logger.title("> Errors:");
        logger.log(errors);
      }
      logger.title("Complete..");

      fs.writeFileSync(f.replace(".ts", ".js"), js);
    });
  }
};

tscc();
