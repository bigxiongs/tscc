import { Module, Node, Statement, Table, Symbol } from "./types";
import { error } from "./error";
function bindStatement(locals: Table, statement: Statement): void {
  if (statement.kind != Node.VAR && statement.kind != Node.TYPEALIAS) return;

  const symbol = locals.get(statement.name.text);
  if (!symbol)
    return (
      locals.set(statement.name.text, {
        declarations: [statement],
        valueDeclaration: statement.kind === Node.VAR ? statement : undefined,
      }),
      undefined
    );

  const other = symbol.declarations.find((d) => d.kind === statement.kind);
  if (other)
    return error(
      statement.pos,
      `Cannot redeclare ${statement.name.text}; first declared at ${other.pos}`
    );

  symbol.declarations.push(statement);
  if (statement.kind === Node.VAR) symbol.valueDeclaration = statement;
}

export function bind(m: Module): void {
  m.statements.forEach((stmt) => bindStatement(m.locals, stmt));
}

export function resolve(
  locals: Table,
  name: string,
  meaning: Node.VAR | Node.TYPEALIAS
): Symbol | undefined {
  const symbol = locals.get(name);
  if (symbol?.declarations.some((d) => d.kind == meaning)) return symbol;
}
