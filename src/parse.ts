import { Lexer, Token } from "./token";
import {
  AST,
  TModule,
  TStatement,
  TDecl,
  TExpr,
  TVar,
  TID,
  TLet,
  TConst,
  TFunction,
  TType,
  TIf,
  TWhile,
  TReturn,
  TTypeExpr,
  TUndefined,
} from "./ast";
import { error } from "./error";

let lexer: Lexer;

const parseModule = (): TModule => {
  const statements = parseStatements();
  expect(Token.EOF);
  return { kind: AST.MODULE, statements, locals: new Map() };
};

const parseStatements = (): TStatement[] => {
  const statements: TStatement[] = Array<TStatement>();
  do {
    const stmt = parseStatement();
    if (stmt) statements.push(stmt);
    else break;
  } while (
    (tryExpect(Token.SEMICOLON) || lexer.newline) &&
    lexer.token != Token.EOF
  );
  return statements;
};

const parseStatement = (): TStatement => {
  switch (lexer.token) {
    case Token.VAR:
      return parseDeclare();
    case Token.LET:
      return parseDeclare();
    case Token.CONST:
      return parseDeclare();
    case Token.FUNCTION:
      return parseDeclare();
    case Token.TYPE:
      return parseDeclare();
    case Token.IF:
      return parseIf();
    case Token.WHILE:
      return parseWhile();
    case Token.ID:
      return parseExp();
    case Token.RETURN:
      return parseReturn();
    default:
      return parseExp();
  }
};

const parseDeclare = (token = lexer.token): TDecl => {
  expect(token);
  switch (token) {
    case Token.VAR:
      return parseVar();
    case Token.LET:
      return parseLet();
    case Token.CONST:
      return parseConst();
    case Token.FUNCTION:
      return parseFunction();
    case Token.TYPE:
      return parseTypeAlias();
    default:
      throw new Error();
  }
};

const parseVar = (pos = lexer.pos): TVar => {
  const id = expectID();
  const type = tryExpect(Token.COLON) ? parseType() : undefined;
  const value = tryExpect(Token.EQUAL) ? parseExp() : undefined;
  return { kind: AST.VAR, id, type, value, pos };
};

const parseLet = (pos = lexer.pos): TLet => {
  const id = expectID();
  const type = tryExpect(Token.COLON) ? parseType() : undefined;
  const value = tryExpect(Token.EQUAL) ? parseExp() : undefined;
  return { kind: AST.LET, id, type, value, pos };
};

const parseConst = (pos = lexer.pos): TConst => {
  const id = expectID();
  const type = tryExpect(Token.COLON) ? parseType() : undefined;
  const value = tryExpect(Token.EQUAL)
    ? parseExp()
    : ({ kind: AST.UNDEFINED, pos } as TUndefined);
  return { kind: AST.CONST, id, type, value, pos };
};

const parseFunction = (pos = lexer.pos): TFunction => {
  const id = expectID();
  expect(Token.LPAREN);
  const args = [];
  while (lexer.token == Token.ID) args.push(parseVar());
  expect(Token.RPAREN);
  const type = tryExpect(Token.COLON) ? parseType() : "void";
  expect(Token.LCURLY);
  const body = parseStatements();
  expect(Token.RCURLY);
  return { kind: AST.FUNCTION, id, type: type ?? "void", args, body, pos };
};

const parseProp = (pos = lexer.pos): TVar => {
  const id = expectID();
  const value = tryExpect(Token.COLON) ? parseExp() : undefined;
  return { kind: AST.VAR, id, value, pos };
};

const parseTypeAlias = (pos = lexer.pos): TType => {
  const id = expectID();
  expect(Token.EQUAL);
  const type = parseType();
  return { kind: AST.TYPE, id, type: type ?? "any", pos };
};

const parseIf = (pos = lexer.pos): TIf => {
  expect(Token.IF);
  expect(Token.LPAREN);
  const cond = parseExp();
  expect(Token.RPAREN);
  let thenn: TStatement[] = [];
  if (tryExpect(Token.LCURLY)) {
    thenn = parseStatements();
    expect(Token.RCURLY);
  } else {
    thenn.push(parseStatement());
  }
  let elsee: TStatement[] = [];
  if (tryExpect(Token.ELSE)) {
    if (tryExpect(Token.LCURLY)) {
      elsee = parseStatements();
      expect(Token.RCURLY);
    } else {
      elsee = [parseStatement()];
    }
  }
  return { kind: AST.IF, cond, thenn, elsee, pos };
};

const parseWhile = (pos = lexer.pos): TWhile => {
  expect(Token.WHILE);
  expect(Token.LPAREN);
  const cond = parseExp();
  expect(Token.RPAREN);
  let body: TStatement[] = [];
  if (tryExpect(Token.LCURLY)) {
    body = parseStatements();
    expect(Token.RCURLY);
  } else {
    body.push(parseStatement());
  }
  return { kind: AST.WHILE, cond, body, pos };
};

const parseReturn = (pos = lexer.pos): TReturn => {
  expect(Token.RETURN);
  const value = parseExp();
  return { kind: AST.RETURN, value, pos };
};

const parseExprList = (): TExpr[] => {
  const exps: TExpr[] = [];
  if (lexer.token == Token.RPAREN) return exps;
  exps.push(parseExp());
  while (tryExpect(Token.COMMA)) exps.push(parseExp());
  return exps;
};

const parseAtomExp = (
  pos = lexer.pos,
  token = lexer.token,
  lexeme = lexer.lexeme
): TExpr => {
  let funcid, args: any[];
  expect(token);
  switch (token) {
    case Token.LPAREN:
      let exps = parseExprList();
      expect(Token.RPAREN);
      if (exps.length == 1) return exps[0];
      return { kind: AST.LIST, list: exps, pos };
    case Token.NUMBERLITERAL:
      return { kind: AST.NUM, value: +lexeme, pos };
    case Token.TRUE:
      return { kind: AST.TRUE, pos };
    case Token.FALSE:
      return { kind: AST.FALSE, pos };
    case Token.TUNDEFINED:
      return { kind: AST.UNDEFINED, pos };
    case Token.THIS:
      return { kind: AST.THIS, pos };
    case Token.ID:
      return { kind: AST.ID, id: lexeme, pos };
    case Token.NEW:
      funcid = parseCallExp();
      expect(Token.LPAREN);
      args = parseExprList();
      expect(Token.RPAREN);
      return { kind: AST.NEW, funcid, args, pos };
    case Token.FUNCTION:
      if (lexer.token == Token.ID)
        funcid = { kind: AST.ID, id: lexer.lexeme, pos } as TID;
      expect(Token.LPAREN);
      args = [];
      while (lexer.token == Token.ID) args.push(parseVar());
      expect(Token.RPAREN);
      const type = tryExpect(Token.COLON) ? parseType() : "void";
      expect(Token.LCURLY);
      const body = parseStatements();
      expect(Token.RCURLY);
      return {
        kind: AST.FUNCEXP,
        id: funcid,
        type: type ?? "void",
        args,
        body,
        pos,
      };
    case Token.LCURLY:
      args = [];
      if (tryExpect(Token.RCURLY)) return { kind: AST.OBJ, props: args, pos };
      do {
        args.push(parseProp());
      } while (tryExpect(Token.COMMA) && lexer.token != Token.RCURLY);
      expect(Token.RCURLY);
      return { kind: AST.OBJ, props: args, pos };
    default:
      error(pos, "Expected identifier or literal but got " + token);
      return { kind: AST.ID, id: "(missing)", pos };
  }
};

// callexp ::= atomexp
//           | atomexp.id
//           | atomexp[exp]
const parseCallExp = (pos = lexer.pos): TExpr => {
  const obj = parseAtomExp();
  if (lexer.lexeme != "." && lexer.lexeme != "[") return obj;
  if (lexer.lexeme == ".") {
    expect(lexer.token);
    const prop = expectID();
    return { kind: AST.PROP, prop, obj, pos };
  } else {
    expect(lexer.token);
    const index = parseExp();
    expect(Token.RBARCKET);
    return { kind: AST.ELE, obj, index, pos };
  }
};

// notexp ::= callexp
//          | callexp(...exp)
const parseNotExp = (pos = lexer.pos): TExpr => {
  const funcid = parseCallExp();
  if (!tryExpect(Token.LPAREN)) return funcid;
  const args = parseExprList();
  expect(Token.RPAREN);
  return { kind: AST.CALL, funcid, args, pos };
};

const parseTimesExp = (pos = lexer.pos): TExpr => {
  if (tryExpect(Token.BANG))
    return { kind: AST.UOP, op: "!", exp: parseTimesExp(), pos };
  if (tryExpect(Token.SUB))
    return { kind: AST.UOP, op: "-", exp: parseTimesExp(), pos };
  return parseNotExp();
};

const parseAddExp = (pos = lexer.pos): TExpr => {
  const left = parseTimesExp();
  let op = lexer.lexeme;
  if (op != "*" && op != "/") return left;
  expect(lexer.token);
  const right = parseTimesExp();
  return { kind: AST.BOP, left, op, right, pos };
};

const parseLtExp = (pos = lexer.pos): TExpr => {
  const left = parseAddExp();
  let op = lexer.lexeme;
  if (op != "+" && op != "-") return left;
  expect(lexer.token);
  const right = parseAddExp();
  return { kind: AST.BOP, left, op, right, pos };
};

const parseAndExp = (pos = lexer.pos): TExpr => {
  const left = parseLtExp();
  let op = lexer.lexeme;
  if (op != "<" && op != ">" && op != "==" && op != "===" && op != "!=")
    return left;
  expect(lexer.token);
  const right = parseLtExp();
  return { kind: AST.BOP, left, op, right, pos };
};

const parseAssignExp = (pos = lexer.pos): TExpr => {
  const left = parseAndExp();
  let op = lexer.lexeme;
  if (op != "&&" && op != "||") return left;
  expect(lexer.token);
  const right = parseAndExp();
  return { kind: AST.BOP, left, op, right, pos };
};

// export type TExpr =
//   | TEle id[expr]
//   | TBop id op id
//   | TUop op id
//   | TCall exp(..)
//   | TProp id.id
//   | TFalse false
//   | TTrue true
//   | TThis this
//   | TNew new id(...)
//   | TID id
//   | TNumber numliteral
//   | TAssign id = expr
//   | TArrayAssign obj[exp] = expr
//   | TPropAssign obj.id = expr
const parseExp = (pos = lexer.pos): TExpr => {
  const left = parseAssignExp();
  let op = lexer.lexeme;
  if (op != "=") return left;
  expect(lexer.token);
  const right = parseExp();
  switch (left.kind) {
    case AST.ID:
      return { kind: AST.ASSIGN, id: left, value: right, pos };
    case AST.ELE:
      return { kind: AST.ARRAYASSIGN, ele: left, value: right, pos };
    case AST.PROP:
      return { kind: AST.PROPASSIGN, prop: left, value: right, pos };
    default:
      error(pos, "Assign to a expression is invalid");
      return left;
  }
};

const expectID = (pos = lexer.pos, lexeme = lexer.lexeme): TID => {
  if (tryExpect(Token.ID)) return { kind: AST.ID, id: lexeme, pos };
  error(pos, "Expected identifier but got a literal" + lexer.token);
  return { kind: AST.ID, id: "(missing)", pos: pos };
};

const parseUnionType = (token = lexer.token): TTypeExpr | undefined => {
  let type: TTypeExpr | undefined = undefined;
  let args: TVar[] = [];
  expect(token);
  switch (token) {
    case Token.TNUMBER:
      type = "number";
      if (tryExpect(Token.LBRACKET)) {
        expect(Token.RBARCKET);
        type = { kind: AST.ARRAYTYPE, type };
      }
      break;
    case Token.TSTRING:
      type = "string";
      if (tryExpect(Token.LBRACKET)) {
        expect(Token.RBARCKET);
        type = { kind: AST.ARRAYTYPE, type };
      }
      break;
    case Token.TBOOLEAN:
      type = "boolean";
      if (tryExpect(Token.LBRACKET)) {
        expect(Token.RBARCKET);
        type = { kind: AST.ARRAYTYPE, type };
      }
      break;
    case Token.TUNDEFINED:
      type = "undefined";
      if (tryExpect(Token.LBRACKET)) {
        expect(Token.RBARCKET);
        type = { kind: AST.ARRAYTYPE, type };
      }
      break;
    // case Token.TOBJECT:
    //   type = "object";
    //   break;
    case Token.LPAREN:
      while (lexer.token == Token.ID) args.push(parseVar());
      expect(Token.RPAREN);
      expect(Token.EQUAL);
      expect(Token.GT);
      let ret = parseType();
      type = { kind: AST.FUNCTYPE, args, return: ret ?? "void" };
      break;
    case Token.LCURLY:
      if (tryExpect(Token.RCURLY)) {
        type = { kind: AST.OBJECTTYPE, props: args };
        break;
      }
      do {
        args.push(parseVar());
      } while (
        lexer.token != Token.RCURLY &&
        (tryExpect(Token.SEMICOLON) || tryExpect(Token.COMMA) || lexer.newline)
      );
      expect(Token.RCURLY);
      type = { kind: AST.OBJECTTYPE, props: args };
      break;
  }
  return type;
};

const parseType = (): TTypeExpr | undefined => {
  let typ1 = parseUnionType();
  if (!typ1) return undefined;
  if (lexer.token != Token.BAR) return typ1;
  let union = [typ1];
  while (tryExpect(Token.BAR)) {
    let typ2 = parseUnionType();
    if (!typ2) break;
    union.push(typ2);
  }
  return { kind: AST.UNIONTYPE, union };
};

const tryExpect = (expected: Token) => {
  const ok = lexer.token == expected;
  if (ok) lexer.next();
  return ok;
};

const expect = (expected: Token) => {
  if (!tryExpect(expected))
    error(lexer.pos, `parseToken: Expected ${expected} but got ${lexer.token}`);
};

export const parse = (_lexer: Lexer): TModule => {
  lexer = _lexer;
  lexer.next();
  const module = parseModule();
  return module;
};
