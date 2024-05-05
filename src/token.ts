export enum Token {
  // reserved
  FUNCTION = "function",
  VAR = "var",
  LET = "let",
  CONST = "const",
  TYPE = "type",
  INTERFACE = "interface",
  RETURN = "return",
  TRUE = "true",
  FALSE = "false",
  THIS = "this",
  NEW = "new",
  IF = "if",
  ELSE = "else",
  WHILE = "while",
  TNUMBER = "number",
  TSTRING = "string",
  TBOOLEAN = "boolean",
  TUNDEFINED = "undefined",
  TOBJECT = "object",
  // TFUNCTION, // function, overload with function

  // mark
  PLUS = "+",
  PLUSPLUS = "++",
  SUB = "-",
  SUBSUB = "--",
  STAR = "*",
  STARSTAR = "**",
  SLASH = "/",
  SLASHSLASH = "//",
  AMPERSAND = "&",
  AMPERSANDAMPERSAND = "&&",
  BAR = "|",
  BARBAR = "||",
  XOR = "^",
  TILD = "~",
  QUESTION = "?",
  BANG = "!",
  QUESTIONQUESTION = "??",
  DOT = ".",
  DOTDOTDOT = "...",
  COMMA = ",",
  LT = "<",
  LTLT = "<<",
  GT = ">",
  GTGT = ">>",
  LPAREN = "(",
  RPAREN = ")",
  LBRACKET = "[",
  RBARCKET = "]",
  LCURLY = "{",
  RCURLY = "}",
  EQUAL = "=",
  EQUALEQUAL = "==",
  EQUALEQUALEQUAL = "===",
  BANGEQUAL = "!=",
  BANGEQUALEQUAL = "!==",
  QUOTE = '"',
  STRINGLITERAL = "\\w",
  NUMBERLITERAL = "\\d",
  NEWLINE = "\\n",
  SEMICOLON = ";",
  COLON = ":",

  UNKNOWN = "unknown",
  BOF = "BOF",
  EOF = "EOF",

  ID = "id", // _a-zA-Z
}

export interface TokenMap {
  [index: string]: Token;
}

export type Lexer = {
  next(): void;
  token: Token;
  pos: number;
  lexeme: string;
  newline: boolean;
};

export const keywords: TokenMap = {
  ["function"]: Token.FUNCTION,
  ["var"]: Token.VAR,
  ["let"]: Token.LET,
  ["const"]: Token.CONST,
  ["type"]: Token.TYPE,
  ["interface"]: Token.INTERFACE,
  ["return"]: Token.RETURN,
  ["true"]: Token.TRUE,
  ["false"]: Token.FALSE,
  ["this"]: Token.THIS,
  ["new"]: Token.NEW,
  ["if"]: Token.IF,
  ["else"]: Token.ELSE,
  ["while"]: Token.WHILE,
  ["number"]: Token.TNUMBER,
  ["string"]: Token.TSTRING,
  ["boolean"]: Token.TBOOLEAN,
  ["undefiend"]: Token.TUNDEFINED,
  ["object"]: Token.TOBJECT,
};

export const symbols: TokenMap = {
  ["+"]: Token.PLUS,
  ["-"]: Token.SUB,
  ["*"]: Token.STAR,
  ["/"]: Token.SLASH,
  ["&"]: Token.AMPERSAND,
  ["|"]: Token.BAR,
  ["?"]: Token.QUESTION,
  ["."]: Token.DOT,
  [","]: Token.COMMA,
  ["<"]: Token.LT,
  [">"]: Token.GT,
  ["="]: Token.EQUAL,
  ["'"]: Token.QUOTE,
  ['"']: Token.QUOTE,
  ["("]: Token.LPAREN,
  [")"]: Token.RPAREN,
  ["["]: Token.LBRACKET,
  ["]"]: Token.RBARCKET,
  ["{"]: Token.LCURLY,
  ["}"]: Token.RCURLY,
  ["\n"]: Token.NEWLINE,
  [":"]: Token.COLON,
  [";"]: Token.SEMICOLON,
};

export const duplicateSymbols: TokenMap = {
  ["++"]: Token.PLUSPLUS,
  ["--"]: Token.SUBSUB,
  ["**"]: Token.STARSTAR,
  ["//"]: Token.SLASHSLASH,
  ["&&"]: Token.AMPERSANDAMPERSAND,
  ["||"]: Token.BARBAR,
  ["??"]: Token.QUESTIONQUESTION,
  ["..."]: Token.DOTDOTDOT,
  ["<<"]: Token.LTLT,
  [">>"]: Token.GTGT,
  ["=="]: Token.EQUALEQUAL,
  ["==="]: Token.EQUALEQUALEQUAL,
  ["!="]: Token.BANGEQUAL,
  ["!=="]: Token.BANGEQUALEQUAL,
};
