export enum AST {
  MODULE,
  STATEMENT,
  ASSIGN,
  ARRAYASSIGN,
  PROPASSIGN,
  IF,
  WHILE,
  EXPR,
  DECL,
  VAR,
  LET,
  CONST,
  FUNCTION,
  RETURN,
  TYPE,
  FUNCTYPE,
  UNIONTYPE,
  OBJECTTYPE,
  ARRAYTYPE,
  ELE,
  BOP,
  UOP,
  CALL,
  PROP,
  FALSE,
  TRUE,
  UNDEFINED,
  NUM,
  THIS,
  NEW,
  ID,
  LIST,
  FUNCEXP,
  OBJ,
}

export type TModule = {
  kind: AST.MODULE;
  statements: TStatement[];
  locals: Table;
};

export type TStatement = TIf | TWhile | TDecl | TExpr | TReturn;
export type TDecl = TVar | TLet | TConst | TFunction | TType;
export type TExpr =
  | TEle
  | TBop
  | TUop
  | TCall
  | TProp
  | TFalse
  | TTrue
  | TUndefined
  | TThis
  | TNew
  | TID
  | TNumber
  | TAssign
  | TArrayAssign
  | TPropAssign
  | TList // (...exp)
  | TFuncExp
  | TObj;
export type TPrim =
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  // | "object"
  | "any"
  | "void";

export type TAssign = Location & {
  kind: AST.ASSIGN;
  id: TID;
  value: TExpr;
};

export type TArrayAssign = Location & {
  kind: AST.ARRAYASSIGN;
  ele: TEle;
  value: TExpr;
};

export type TPropAssign = Location & {
  kind: AST.PROPASSIGN;
  prop: TProp;
  value: TExpr;
};

export type TIf = Location & {
  kind: AST.IF;
  cond: TExpr;
  thenn: TStatement[];
  elsee: TStatement[];
};

export type TWhile = Location & {
  kind: AST.WHILE;
  cond: TExpr;
  body: TStatement[];
};

export type TVar = Location & {
  kind: AST.VAR;
  id: TID;
  type?: TTypeExpr;
  value?: TExpr;
};

export type TLet = Location & {
  kind: AST.LET;
  id: TID;
  type?: TTypeExpr;
  value?: TExpr;
};

export type TConst = Location & {
  kind: AST.CONST;
  id: TID;
  type?: TTypeExpr;
  value: TExpr;
};

export type TFunction = Location & {
  kind: AST.FUNCTION;
  id: TID;
  type: TTypeExpr;
  args: TVar[];
  body: TStatement[];
};
export type TReturn = Location & { kind: AST.RETURN; value: TExpr };

export type TType = Location & { kind: AST.TYPE; id: TID; type: TTypeExpr };

export type TTypeExpr =
  | TFuncType
  | TUnionType
  | TObjectType
  | TID
  | TPrim
  | TArrayType;
export type TFuncType = {
  kind: AST.FUNCTYPE;
  args: TVar[] | TTypeExpr[];
  return: TTypeExpr;
};
export type TUnionType = {
  kind: AST.UNIONTYPE;
  union: TTypeExpr[];
};
export type TObjectType = { kind: AST.OBJECTTYPE; props: TVar[] };
export type TArrayType = { kind: AST.ARRAYTYPE; type: TTypeExpr };

export type TEle = Location & { kind: AST.ELE; obj: TExpr; index: TExpr };
export type TProp = Location & { kind: AST.PROP; prop: TID; obj: TExpr };

export type TBop = Location & {
  kind: AST.BOP;
  left: TExpr;
  op:
    | "+"
    | "-"
    | "*"
    | "/"
    | "&"
    | "|"
    | ">"
    | "<"
    | "=="
    | "==="
    | "&&"
    | "||"
    | "!="
    | "!==";
  right: TExpr;
};

export type TUop = Location & {
  kind: AST.UOP;
  exp: TExpr;
  op: "!" | "-";
};

export type TCall = Location & { kind: AST.CALL; funcid: TExpr; args: TExpr[] };
export type TThis = Location & { kind: AST.THIS };
export type TTrue = Location & { kind: AST.TRUE };
export type TFalse = Location & { kind: AST.FALSE };
export type TUndefined = Location & { kind: AST.UNDEFINED };
export type TNumber = Location & { kind: AST.NUM; value: number };
export type TID = Location & { kind: AST.ID; id: string };
export type TNew = Location & { kind: AST.NEW; funcid: TExpr; args: TExpr[] };
export type TList = Location & { kind: AST.LIST; list: TExpr[] };
export type TFuncExp = Location & {
  kind: AST.FUNCEXP;
  id?: TID;
  type: TTypeExpr;
  args: TVar[];
  body: TStatement[];
};
export type TObj = Location & { kind: AST.OBJ; props: TVar[] };

export type Error = {
  pos: number;
  message: string;
};

export interface Location {
  pos: number;
}

export type Symbol = {
  value?: TTypeExpr;
  type?: TTypeExpr;
};

export type Table = Map<string, Symbol>;
