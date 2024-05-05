import {
  TStatement,
  AST,
  TModule,
  Table,
  TTypeExpr,
  TExpr,
  TObjectType,
  TFuncType,
  TUnionType,
  TPrim,
} from "./ast";
import { error } from "./error";
import { bind, resolveType, resolveValue } from "./bind";

function checkStatement(statement: TStatement, ...locals: Table[]) {
  switch (statement.kind) {
    case AST.IF:
      checkExpr(statement.cond, ...locals);
      checkScope(statement.thenn, ...locals);
      checkScope(statement.elsee, ...locals);
      break;
    case AST.WHILE:
      checkExpr(statement.cond, ...locals);
      checkScope(statement.body, ...locals);
      break;
    case AST.RETURN:
      checkExpr(statement.value, ...locals);
      break;
    // TDecl
    case AST.VAR:
      let symbol = locals[0].get(statement.id.id);
      if (symbol?.value?.kind == AST.VAR || symbol?.value?.kind == AST.FUNCTION)
        symbol.value = statement;
      // typ = statement.value && checkExpression(statement.value);
      // typ && expect(typ, statement.type ?? "any", statement.pos, ...locals);
      break;
    case AST.LET:
      break;
    case AST.CONST:
      break;
    case AST.FUNCTION:
      break;
    case AST.TYPE:
      break;
    default:
      checkExpr(statement, ...locals);
  }
}

function checkExpr(expr: TExpr, ...locals: Table[]): TTypeExpr {
  let typ1: TTypeExpr = "any", typ2: TTypeExpr = "any";
  switch (expr.kind) {
    case AST.ELE:
      typ1 = checkExpr(expr.obj);
      typ2 = checkExpr(expr.index);
      expect(typ1, "object", expr.pos, ...locals);
      expect(typ2, "number", expr.pos, ...locals);
      return checkEle(typ1, typ2, ...locals);
    case AST.BOP:
      typ1 = checkExpr(expr.left);
      typ2 = checkExpr(expr.right);
      if (["+", "-", "*", "/", "&", "|"].includes(expr.op)) return "number";
      return "boolean";
    case AST.UOP:
      typ1 = checkExpr(expr.exp);
      if (["-"].includes(expr.op)) return "number";
      return "boolean";
    case AST.CALL:
      typ1 = checkExpr(expr.funcid) as TFuncType;
      expect(typ1, "function", expr.pos, ...locals);
      for (let i = 0; i < expr.args.length; i++) {
        expect(
          checkExpr(expr.args[i]),
          typ1.args[i],
          expr.pos,
          ...locals
        );
      }
      return typ1.return;
    case AST.PROP:
      typ1 = checkExpr(expr.obj) as TObjectType;
      expect(typ1, "object", expr.pos, ...locals);
      return typ1.props[expr.prop.id];
    case AST.FALSE:
      return "boolean";
    case AST.TRUE:
      return "boolean";
    case AST.THIS:
      return "object";
    case AST.NEW:
      return "object";
    case AST.ID:
      return resolveType(expr.id, ...locals) ?? "any";
    case AST.NUM:
      return "number";
    case AST.ASSIGN:
      typ1 = resolveType(expr.id.id, ...locals);
      typ2 = checkExpr(expr.value, ...locals);
      expect(typ1, typ2, expr.pos, ...locals);
      return typ2;
    case AST.PROPASSIGN:
      typ1 = checkExpr(expr.prop, ...locals);
      typ2 = checkExpr(expr.value, ...locals);
      expect(typ1, typ2, expr.pos, ...locals);
      return typ2;
    case AST.ARRAYASSIGN:
      typ1 = checkExpr(expr.ele, ...locals);
      typ2 = checkExpr(expr.value, ...locals);
      expect(typ1, typ2, expr.pos, ...locals);
      return typ2;
    case AST.LIST:
      for (let i = 0; i < expr.list.length; i++)
        typ1 = checkExpr(expr.list[i]);
      if (typ1) return typ1;
      return "any";
    case AST.FUNCEXP:
      return "function";
    case AST.OBJ:
      return { kind: AST.OBJECTTYPE, props: expr.props };
  }
}

const checkEle = (
  obj: TObjectType,
  index: TTypeExpr,
  ...locals: Table[]
): TTypeExpr => {
  return "any";
};

const expect = (
  provided: TTypeExpr,
  expected: TTypeExpr,
  pos: number,
  ...locals: Table[]
) => {
  if (!isAssignable(provided, expected, ...locals))
    error(pos, `type '${provided}' is not assignable to type ${expected}`);
};

const isAssignable = (
  provided: TFuncType | TUnionType | TObjectType | TPrim,
  expected: TFuncType | TUnionType | TObjectType | TPrim,
  ...locals: Table[]
): boolean => {
  if (typeof provided == "string") {
    if (typeof expected == "string") return provided == expected;
    switch (expected.kind) {
      case AST.FUNCTYPE:
        return provided == "function"
    }
  }
};

const checkStatements = (statements: TStatement[], ...locals: Table[]) =>
  statements.forEach((stmt) => checkStatement(stmt, ...locals));

const checkScope = (stmts: TStatement[], ...globals: Table[]) =>
  checkStatements(stmts, bind(stmts, new Map()), ...globals);
export const check = (module: TModule) => checkScope(module.statements);
