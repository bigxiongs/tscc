import {
  Table,
  TStatement,
  AST,
  TTypeExpr,

  TType,
  TVar,

  Symbol,
  TFunction,
  TFuncType,
  TUnionType,
  TObjectType,
  TPrim,
  TArrayType,
} from "./ast";
import { checkExpr, expect } from "./check";
import { error } from "./error";

export const bindFunction = (
  stmts: TStatement[],
  local: Table,
  ...globals: Table[]
) => {
  stmts
    .filter((stmt) => stmt.kind == AST.FUNCTION)
    .forEach((stmt) => {
      let func = stmt as TFunction;
      let typ = {
        kind: AST.FUNCTYPE,
        args: func.args,
        return: func.type,
      } as TFuncType;
      if (!local.has(func.id.id))
        local.set(func.id.id, { value: resolveType(typ, local, ...globals) });
      else {
        let symbol = local.get(func.id.id) as Symbol;
        symbol.value = resolveType(typ, local, ...globals);
      }
    });
};

export const bindVar = (
  stmts: TStatement[],
  local: Table,
  ...globals: Table[]
) => {
  stmts
    .filter((stmt) => stmt.kind == AST.VAR)
    .forEach((stmt) => {
      let tvar = stmt as TVar;
      if (!local.has(tvar.id.id)) local.set(tvar.id.id, { value: "undefined" });
      else {
        let symbol = local.get(tvar.id.id) as Symbol;
        symbol.value = "undefined";
      }
    });
};

export const bindType = (
  stmts: TStatement[],
  local: Table,
  ...globals: Table[]
) => {
  stmts
    .filter((stmt) => stmt.kind == AST.TYPE)
    .forEach((stmt) => {
      let alias = stmt as TType;
      if (local.has(alias.id.id))
        return error(alias.pos, `Cannot redeclare type ${alias.id}`);
      local.set(alias.id.id, { type: alias.type, value: undefined });
    });
  local.forEach((symbol) => {
    if (
      symbol.type &&
      typeof symbol.type != "string" &&
      symbol.type.kind == AST.ID
    )
      symbol.type = resolveType(symbol.type, local, ...globals);
  });
};

export const bind = (
  statements: TStatement[],
  local: Table,
  ...globals: Table[]
) => {
  bindType(statements, local, ...globals);
  bindVar(statements, local, ...globals);
  bindFunction(statements, local, ...globals);
  return local;
};

export const resolveType = (
  typ: TTypeExpr,
  ...locals: Table[]
): TFuncType | TUnionType | TObjectType | TPrim | TArrayType => {
  if (typeof typ == "string") return typ;
  switch (typ.kind) {
    case AST.ID:
      for (let i = 0; i < locals.length; i++)
        if (locals[i].has(typ.id) && locals[i].get(typ.id)?.type)
          return (
            (locals[i].get(typ.id)?.type &&
              resolveType(
                locals[i].get(typ.id)?.type as TTypeExpr,
                ...locals
              )) ??
            "any"
          );
      return "any";
    case AST.FUNCTYPE:
      let args: TVar[] | TTypeExpr[] = [...typ.args] as TVar[] | TTypeExpr[];
      let ret = typ.return;
      if (args.length == 0)
        return {
          kind: AST.FUNCTYPE,
          args: [],
          return: resolveType(ret, ...locals),
        };
      if (typeof args[0] != "string" && args[0].kind == AST.VAR)
        for (let i = 0; i < args.length; i++) {
          let argTyp = args[i] as TVar;
          let typ = argTyp.type ?? ("any" as TTypeExpr);
          args[i] = resolveType(typ, ...locals);
        }
      for (let i = 0; i < args.length; i++) {
        let typ = args[i] as TTypeExpr;
        args[i] = resolveType(typ, ...locals);
      }
      return { kind: AST.FUNCTYPE, args, return: resolveType(ret, ...locals) };
    case AST.UNIONTYPE:
      let union = [...typ.union];
      for (let i = 0; i < union.length; i++) {
        union[i] = resolveType(union[i], ...locals);
      }
      return { kind: AST.UNIONTYPE, union };
    case AST.OBJECTTYPE:
      let props = [...typ.props];
      for (let i = 0; i < props.length; i++) {
        let p = props[i];
        props[i] = {
          kind: AST.VAR,
          id: p.id,
          type: resolveType(p.type ?? "any", ...locals),
          pos: p.pos,
        };
      }
      return { kind: AST.OBJECTTYPE, props };
    case AST.ARRAYTYPE:
      return { kind: AST.ARRAYTYPE, type: resolveType(typ.type, ...locals) };
  }
};
