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
  Symbol,
  TArrayType,
  TVar,
  TFuncExp,
  TProp,
} from "./ast";
import { error } from "./error";
import { bind, resolveType } from "./bind";

function checkStatement(
  stmt: TStatement,
  retType: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  ...locals: Table[]
) {
  switch (stmt.kind) {
    case AST.IF:
      checkExpr(stmt.cond, ...locals);
      checkBlock(stmt.thenn, retType, ...locals);
      checkBlock(stmt.elsee, retType, ...locals);
      break;
    case AST.WHILE:
      checkExpr(stmt.cond, ...locals);
      checkBlock(stmt.body, retType, ...locals);
      break;
    case AST.RETURN:
      expect(checkExpr(stmt.value, ...locals), retType, stmt.pos, ...locals);
      break;
    // TDecl
    case AST.VAR:
      let symbol;
      for (let i = 0; i < locals.length; i++) {
        if ((symbol = locals[i].get(stmt.id.id))) break;
      }
      symbol = symbol as Symbol;
      symbol.value = resolveType(
        stmt.type ?? (stmt.value && checkExpr(stmt.value)) ?? "any",
        ...locals
      );
      break;
    case AST.LET:
      if (locals[0].has(stmt.id.id))
        error(stmt.pos, `re-declare variable ${stmt.id}`);
      else
        locals[0].set(stmt.id.id, {
          value: resolveType(
            stmt.type ?? (stmt.value && checkExpr(stmt.value)) ?? "any",
            ...locals
          ),
        });
      break;
    case AST.CONST:
      if (locals[0].has(stmt.id.id))
        error(stmt.pos, `re-declare variable ${stmt.id}`);
      else
        locals[0].set(stmt.id.id, {
          value: resolveType(
            stmt.type ?? (stmt.value && checkExpr(stmt.value)) ?? "any",
            ...locals
          ),
        });
      break;
    case AST.FUNCTION:
      break;
    case AST.TYPE:
      break;
    default:
      checkExpr(stmt, ...locals);
  }
}

export function checkExpr(
  expr: TExpr,
  ...locals: Table[]
): TFuncType | TUnionType | TObjectType | TPrim | TArrayType {
  let typ1: TTypeExpr = "any",
    typ2: TTypeExpr = "any";
  switch (expr.kind) {
    case AST.ELE:
      typ1 = checkExpr(expr.obj, ...locals) as TArrayType;
      typ2 = checkExpr(expr.index, ...locals);
      expectArray(typ1, expr.pos);
      expect(typ2, "number", expr.pos, ...locals);
      return resolveType(typ1.type, ...locals);
    case AST.BOP:
      typ1 = checkExpr(expr.left, ...locals);
      typ2 = checkExpr(expr.right, ...locals);
      if (["+", "-", "*", "/", "&", "|"].includes(expr.op)) return "number";
      return "boolean";
    case AST.UOP:
      typ1 = checkExpr(expr.exp, ...locals);
      if (["-"].includes(expr.op)) return "number";
      return "boolean";
    case AST.CALL:
      typ1 = checkExpr(expr.funcid, ...locals) as TFuncType;
      expectFunction(typ1, expr.pos);
      for (let i = 0; i < expr.args.length; i++) {
        expect(
          checkExpr(expr.args[i], ...locals),
          checkArg(typ1.args[i], ...locals),
          expr.pos,
          ...locals
        );
      }
      return resolveType(typ1.return, ...locals);
    case AST.PROP:
      return checkProp(expr, ...locals);
    case AST.FALSE:
      return "boolean";
    case AST.TRUE:
      return "boolean";
    case AST.UNDEFINED:
      return "undefined";
    case AST.THIS:
      return { kind: AST.OBJECTTYPE, props: [] };
    case AST.NEW:
      return { kind: AST.OBJECTTYPE, props: [] };
    case AST.ID:
      let symbol = undefined;
      for (let i = 0; i < locals.length; i++) {
        if (!locals[i].get(expr.id)?.value) continue
        symbol = (locals[i].get(expr.id) as Symbol).value as TTypeExpr;
        break;
      }
      if (!symbol) {
        error(expr.pos, `unknown identifier ${expr.id}`);
        return "any";
      }
      return resolveType(symbol, ...locals);
    case AST.NUM:
      return "number";
    case AST.ASSIGN:
      typ1 = checkExpr(expr.id, ...locals);
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
      for (let i = 0; i < expr.list.length; i++) typ1 = checkExpr(expr.list[i], ...locals);
      if (typ1) return typ1;
      return "any";
    case AST.FUNCEXP:
      checkFunc(expr, ...locals);
      return {
        kind: AST.FUNCTYPE,
        args: expr.args,
        return: resolveType(expr.type, ...locals),
      };
    case AST.OBJ:
      return { kind: AST.OBJECTTYPE, props: expr.props };
  }
}

const checkArg = (
  arg: TVar | TTypeExpr,
  ...locals: Table[]
): TFuncType | TUnionType | TObjectType | TPrim | TArrayType => {
  if (typeof arg == "string") return arg;
  // TODO: check value and type are compatible
  if (arg.kind == AST.VAR)
    return arg.type
      ? resolveType(arg.type, ...locals)
      : arg.value
      ? checkExpr(arg.value, ...locals)
      : "any";
  return resolveType(arg, ...locals);
};

const checkFunc = (func: TFuncExp, ...globals: Table[]) => {
  const local = new Map();
  bind(func.args, local, ...globals);
  checkBlock(func.body, resolveType(func.type), local, ...globals);
};

const checkProp = (obj: TProp, ...locals: Table[]) => {
  let o = checkExpr(obj.obj);
  if (typeof o == "string" || o.kind != AST.OBJECTTYPE) {
    error(obj.pos, `${o} is not an object`);
    return "any";
  }
  let p;
  for (let i = 0; i < o.props.length; i++) {
    if (o.props[i].id.id == obj.prop.id) {
      p = o.props[i];
      break;
    }
  }
  if (!p) {
    error(obj.pos, `${obj.prop} is not a property of object ${o}`);
    return "any";
  }
  return checkArg(p, ...locals);
};

export const expect = (
  provided: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  expected: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  pos: number,
  ...locals: Table[]
) => {
  if (!isAssignable(provided, expected, ...locals))
    error(pos, `type '${provided}' is not assignable to type ${expected}`);
};

export const expectArray = (
  provided: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  pos: number
) => {
  if (typeof provided == "string" || provided.kind != AST.ARRAYTYPE)
    error(pos, `type '${provided}' is not an array`);
};

export const expectFunction = (
  provided: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  pos: number
) => {
  if (typeof provided == "string" || provided.kind != AST.FUNCTYPE)
    error(pos, `type '${provided}' is not callable`);
};

const isAssignable = (
  provided: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  expected: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  ...locals: Table[]
): boolean => {
  if (typeof provided == "string" && typeof expected == "string")
    return provided == expected;
  if (typeof provided == "string" || typeof expected == "string") return false;
  switch (expected.kind) {
    case AST.FUNCTYPE:
      if (provided.kind != expected.kind) return false;
      for (let i = 0; i < expected.args.length; i++)
        if (
          !isAssignable(
            checkArg(provided.args[i], ...locals),
            checkArg(expected.args[i], ...locals),
            ...locals
          )
        )
          return false;

      return isAssignable(
        resolveType(provided.return, ...locals),
        resolveType(expected.return, ...locals),
        ...locals
      );
    case AST.UNIONTYPE:
      if (provided.kind == AST.UNIONTYPE) {
        for (let i = 0; i < provided.union.length; i++)
          if (
            isAssignable(
              resolveType(provided.union[i], ...locals),
              expected,
              ...locals
            )
          )
            return true;
      } else {
        for (let i = 0; i < expected.union.length; i++)
          if (
            isAssignable(
              provided,
              resolveType(expected.union[i], ...locals),
              ...locals
            )
          )
            return true;
      }
      return false;
    case AST.OBJECTTYPE:
      if (provided.kind != expected.kind) return false;
      let props1: {
        [index: string]:
          | TFuncType
          | TUnionType
          | TObjectType
          | TPrim
          | TArrayType;
      } = {};
      let props2: {
        [index: string]:
          | TFuncType
          | TUnionType
          | TObjectType
          | TPrim
          | TArrayType;
      } = {};
      provided.props.forEach((p) => (props1[p.id.id] = checkArg(p)));
      expected.props.forEach((p) => (props2[p.id.id] = checkArg(p)));
      for (let k in props1) {
        if (!(k in props2)) return false;
        if (!isAssignable(props1[k], props2[k], ...locals)) return false;
      }
      return true;
    case AST.ARRAYTYPE:
      if (provided.kind != expected.kind) return false;
      return isAssignable(
        resolveType(provided.type, ...locals),
        resolveType(expected.type, ...locals),
        ...locals
      );
  }
};

const checkBlock = (
  stmts: TStatement[],
  retType: TFuncType | TUnionType | TObjectType | TPrim | TArrayType,
  ...locals: Table[]
) => {
  const local = new Map();
  stmts.forEach((stmt) => checkStatement(stmt, retType, local, ...locals));
};

const checkScope = (stmts: TStatement[], ...globals: Table[]) =>
  checkBlock(stmts, "any", bind(stmts, new Map()), ...globals);

export const check = (module: TModule) => checkScope(module.statements);
