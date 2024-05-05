import { Table, TStatement, AST, TTypeExpr, TDecl } from "./ast";
import { error } from "./error";

function bindStatement(locals: Table, statement: TStatement): void {
  if (
    statement.kind != AST.VAR &&
    statement.kind != AST.CONST &&
    statement.kind != AST.LET &&
    statement.kind != AST.FUNCTION &&
    statement.kind != AST.TYPE
  )
    return;
  const symbol = locals.get(statement.id.id);
  if (!symbol)
    return (
      locals.set(statement.id.id, {
        decls: [statement],
        type: statement.kind == AST.TYPE ? statement : undefined,
        value: statement.kind == AST.TYPE ? undefined : statement,
      }),
      undefined
    );

  if (statement.kind == AST.TYPE) {
    if (symbol.type)
      return error(statement.pos, `Cannot redeclare type ${statement.id}`);
    symbol.type = statement;
  } else if (statement.kind == AST.LET || statement.kind == AST.CONST) {
    if (symbol.value)
      return error(statement.pos, `Cannot redeclare type ${statement.id}`);
    symbol.value = statement;
  } else if (statement.kind == AST.FUNCTION) {
    if (symbol.value?.kind == AST.LET || symbol.value?.kind == AST.CONST)
      return error(statement.pos, `Cannot redeclare type ${statement.id}`);
    symbol.value = statement;
  } else if (statement.kind == AST.VAR) {
    if (symbol.value?.kind != AST.VAR)
      return error(statement.pos, `Cannot redeclare type ${statement.id}`);
    symbol.value = statement;
  }

  symbol.decls.push(statement);
}

export const bind = (statements: TStatement[], locals: Table) => (
  statements.forEach((stmt) => bindStatement(locals, stmt)), locals
);

export const resolveType = (id: string, ...locals: Table[]): TTypeExpr => {
  let symbol: TTypeExpr = "any";
  for (let i = 0; i < locals.length; i++)
    if (locals[i].get(id)?.type) {
      symbol = locals[i].get(id)?.type?.type as TTypeExpr
      break
    }
  return symbol
}

export const resolveValue = (id: string, ...locals: Table[]): TDecl | undefined => {
  let symbol;
  for (let i = 0; i < locals.length; i++)
    if (locals[i].get(id)?.value) {
      symbol = locals[i].get(id)?.value
      break
    }
  return symbol
}
