import { Token, Lexer, keywords, symbols, duplicateSymbols } from "./token";

let pos: number;
let lexeme: string;
let token: Token;
let fileContent: string;
let lastNewLine: boolean;

const advance = (skip: (x: string) => boolean) => {
  while (pos < fileContent.length && skip(fileContent.charAt(pos))) pos++;
};

const lexNumber = (start: number) => {
  advance((c) => /[0-9]/.test(c));
  lexeme = fileContent.slice(start, pos);
  token = Token.NUMBERLITERAL;
};

const lexString = (start: number) => {
  advance((c) => /[_a-zA-Z0-9]/.test(c));
  lexeme = fileContent.slice(start, pos);
  token = keywords[lexeme] ?? Token.ID;
};

const tryDuplicate = (start: number) => {
  if (fileContent.slice(start, start + 3) in duplicateSymbols) pos += 2;
  else if (fileContent.slice(start, start + 2) in duplicateSymbols) pos++;
  return fileContent.slice(start, pos + 1);
};

const lexSymbol = (start: number) => {
  lexeme = fileContent.charAt(start);
  if (lexeme in symbols) lexeme = tryDuplicate(start);
  token = duplicateSymbols[lexeme] ?? symbols[lexeme] ?? Token.UNKNOWN;
  pos++
};

const lexEOF = () => (token = Token.EOF);

const next = () => {
  lastNewLine = false
  while (pos < fileContent.length && /[ \t\b\n]/.test(fileContent.charAt(pos))) {
    lastNewLine = fileContent.charAt(pos) == "\n" || lastNewLine
    pos++;
  }
  pos == fileContent.length
    ? lexEOF()
    : /[0-9]/.test(fileContent.charAt(pos))
    ? lexNumber(pos)
    : /[_a-zA-Z]/.test(fileContent.charAt(pos))
    ? lexString(pos)
    : lexSymbol(pos);
};

export const lex = (s: string): Lexer => {
  pos = 0;
  lexeme = "";
  token = Token.BOF;
  fileContent = s;
  lastNewLine = false;
  return new Proxy({}, {
    get(target, p) {
      if (p == "token") return token;
      else if (p == "pos") return pos;
      else if (p == "lexeme") return lexeme;
      else if (p == "next") return next;
      else if (p == "newline") return lastNewLine
      return undefined;
    },
  }) as Lexer;
};
