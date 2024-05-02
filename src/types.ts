export enum Token {
    // reserved
    FUNCTION, // function
    VAR, // var
    LET, // let
    CONST, // const
    TYPE, // type
    INTERFACE, // interface
    RETURN, // return

    // mark
    PLUS, // +
    PLUSPLUS, // ++
    SUB, // -
    SUBSUB, // --
    STAR, // *
    SLASH, // /
    AMPERSAND, // &
    AMPERSANDAMPERSAND, // &&
    BAR, // |
    BARBAR, // ||
    XOR, // ^
    TILD, // ~
    QUESTION, // ?
    DOT, // .
    DOTDOTDOT, // ...
    COMMA, // ,
    LT, // <
    LTLT, // <<
    GT, // >
    GTGT, // >>
    LPAREN, // (
    RPAREN, // )
    LBRACKET, // [
    RBARCKET, // ]
    LCURLY,// {
    RCURLY, // }
    EQUAL, // =
    EQUALEQUAL, // ==
    EQUALEQUALEQUAL, // ===
    QUOTE, // ' "
    STRINGLITERAL, // _a-zA-Z
    NUMBERLITERAL, // 0-9
    NEWLINE, // \n
    SEMICOLON, // ;
    COLON, // :

    UNKNOWN,
    BOF,
    EOF,

    ID, // _a-zA-Z
}
export type Lexer = {
    next(): void
    token: Token,
    pos: number,
    lexeme: string
}
export enum Node {
    ID,
    NUMBERLITERAL,
    ASSIGNMENT,
    EXPRESSION,
    VAR,
    TYPEALIAS,
}
export type Error = {
    pos: number
    message: string
}
export interface Location {
    pos: number
}
export type Expression = Identifier | Literal | Assignment
export type Identifier = Location & {
    kind: Node.ID
    text: string
}
export type Literal = Location & {
    kind: Node.NUMBERLITERAL
    value: number
}
export type Assignment = Location & {
    kind: Node.ASSIGNMENT
    name: Identifier
    value: Expression
}
export type Statement = ExpressionStatement | Var | TypeAlias
export type ExpressionStatement = Location & {
    kind: Node.EXPRESSION
    expr: Expression
}
export type Var = Location & {
    kind: Node.VAR
    name: Identifier
    typename?: Identifier | undefined
    init: Expression
}
export type TypeAlias = Location & {
    kind: Node.TYPEALIAS
    name: Identifier
    typename: Identifier
}
export type Declaration = Var | TypeAlias // plus others, like function
export type Symbol = { 
    valueDeclaration: Declaration | undefined
    declarations: Declaration[] 
}
export type Table = Map<string, Symbol>
export type Module = {
    locals: Table
    statements: Statement[]
}
export type Type = { id: string }