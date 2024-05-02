import { Statement, Node, Expression } from "./types";
export function emit(statements: Statement[]) {
  return statements.map(emitStatement).join(";\n");
}
function emitStatement(statement: Statement): string {
  switch (statement.kind) {
    case Node.EXPRESSION:
      return emitExpression(statement.expr);
    case Node.VAR:
      const typestring = statement.typename ? ": " + statement.name : "";
      return `var ${statement.name.text}${typestring} = ${emitExpression(
        statement.init
      )}`;
    case Node.TYPEALIAS:
      return `type ${statement.name.text} = ${statement.typename.text}`;
  }
}
function emitExpression(expression: Expression): string {
  switch (expression.kind) {
    case Node.ID:
      return expression.text;
    case Node.NUMBERLITERAL:
      return "" + expression.value;
    case Node.ASSIGNMENT:
      return `${expression.name.text} = ${emitExpression(expression.value)}`;
  }
}
