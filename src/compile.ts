import { Error, TModule } from "./ast";
import { errors } from "./error";
import { lex } from "./lex";
import { parse } from "./parse";
import { check } from "./check";
import { emit } from "./emit";

export function compile(file: string): [TModule, Error[], string] {
  errors.clear();
  const lexer = lex(file);
  const tree = parse(lexer);
  check(tree);
  const js = emit(tree.statements);
  return [tree, Array.from(errors.values()), js];
}
