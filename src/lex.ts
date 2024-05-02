import { Token, Lexer } from "./types";
const keywords = {
  function: Token.FUNCTION,
  var: Token.VAR,
  let: Token.LET,
  const: Token.CONST,
  type: Token.TYPE,
  interface: Token.INTERFACE,
  return: Token.RETURN,
};
let pos: number;
let lexeme: string;
let token: Token;
let file: string;

function advance(pred: (x: string) => boolean) {
  while (pos < file.length && pred(file.charAt(pos))) pos++;
}

function next() {
  advance((c) => /[ \t\b\n]/.test(c));
  const start = pos;
  if (pos === file.length) return token = Token.EOF;
  if (/[0-9]/.test(file.charAt(pos))) {
    advance((c) => /[0-9]/.test(c));
    lexeme = file.slice(start, pos);
    token = Token.NUMBERLITERAL;
  } else if (/[_a-zA-Z]/.test(file.charAt(pos))) {
    advance((c) => /[_a-zA-Z0-9]/.test(c));
    lexeme = file.slice(start, pos);
    token =
      lexeme in keywords ? keywords[lexeme as keyof typeof keywords] : Token.ID;
  } else {
    pos++;
    switch (file.charAt(pos - 1)) {
      case "=":
        token = Token.EQUAL;
        break;
      case ";":
        token = Token.SEMICOLON;
        break;
      case ":":
        token = Token.COLON;
        break;
      default:
        token = Token.UNKNOWN;
        break;
    }
  }
}

export function lex(s: string): Lexer {
  pos = 0;
  lexeme = "";
  token = Token.BOF;
  file = s;
  const lexer = { next, token, pos, lexeme };
  return new Proxy<Lexer>(lexer, {
    get(target, p) {
      if (p == "token") return token;
      else if (p == "pos") return pos;
      else if (p == "lexeme") return lexeme;
      else if (p == "next") return next;
      return undefined;
    },
  });
}
