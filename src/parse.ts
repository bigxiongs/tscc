import {
  Lexer,
  Token,
  Node,
  Statement,
  Identifier,
  Expression,
  Module,
} from "./types";
import { error } from "./error";

let lexer: Lexer;

function parseModule(): Module {
  const statements = parseStatements(parseStatement, () =>
    tryExpect(Token.SEMICOLON)
  );
  expect(Token.EOF);
  return { statements, locals: new Map() };
}

function parseStatements(
  parseStatement: () => Statement,
  separator: () => unknown
): Statement[] {
  const statements: Statement[] = Array<Statement>();
  do {
    statements.push(parseStatement());
  } while (separator());
  return statements;
}

function parseStatement(): Statement {
  const pos = lexer.pos;
  switch (lexer.token) {
    case Token.VAR:
      return parseVarDeclare();
    case Token.TYPE:
      return parseTypeDeclare();
    default:
      return { kind: Node.EXPRESSION, expr: parseExpression(), pos };
  }
}

function parseVarDeclare(): Statement {
  const pos = lexer.pos;
  expect(Token.VAR);
  const name = parseIdentifier();
  const typename = tryExpect(Token.COLON) ? parseIdentifier() : undefined;

  expect(Token.EQUAL);
  const init = parseExpression();
  return { kind: Node.VAR, name, typename, init, pos };
}

function parseTypeDeclare(): Statement {
  const pos = lexer.pos;
  expect(Token.TYPE);
  const name = parseIdentifier();
  expect(Token.EQUAL);
  const typename = parseIdentifier();
  return { kind: Node.TYPEALIAS, name, typename, pos };
}

function parseExpression(): Expression {
  const pos = lexer.pos;
  const e = parseIdentifierOrLiteral();
  if (e.kind === Node.ID && tryExpect(Token.EQUAL)) {
    return { kind: Node.ASSIGNMENT, name: e, value: parseExpression(), pos };
  }
  return e;
}

function parseIdentifierOrLiteral(): Expression {
  const pos = lexer.pos;
  if (tryExpect(Token.ID)) {
    return { kind: Node.ID, text: lexer.lexeme, pos };
  } else if (tryExpect(Token.NUMBERLITERAL)) {
    return { kind: Node.NUMBERLITERAL, value: +lexer.lexeme, pos };
  }
  error(pos, "Expected identifier or literal but got " + Token[lexer.token]);
  lexer.next();
  return { kind: Node.ID, text: "(missing)", pos };
}

function parseIdentifier(): Identifier {
  const e = parseIdentifierOrLiteral();
  if (e.kind === Node.ID) {
    return e;
  }
  error(e.pos, "Expected identifier but got a literal");
  return { kind: Node.ID, text: "(missing)", pos: e.pos };
}

function tryExpect(expected: Token) {
  const ok = lexer.token == expected;
  if (ok) lexer.next();

  return ok;
}
function expect(expected: Token) {
  if (!tryExpect(expected)) {
    error(
      lexer.pos,
      `parseToken: Expected ${Token[expected]} but got ${Token[lexer.token]}`
    );
  }
}
export function parse(_lexer: Lexer): Module {
  lexer = _lexer;
  lexer.next();
  return parseModule();
}
