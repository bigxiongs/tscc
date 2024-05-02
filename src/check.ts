import {
  Module,
  Statement,
  Type,
  Node,
  Expression,
  Identifier,
  TypeAlias,
} from "./types";
import { error } from "./error";
import { resolve } from "./bind";

const stringType: Type = { id: "string" };
const numberType: Type = { id: "number" };
const errorType: Type = { id: "error" };

let module: Module;

function typeToString(type: Type) {
  return type.id;
}

function checkStatement(statement: Statement): Type {
  switch (statement.kind) {
    case Node.EXPRESSION:
      return checkExpression(statement.expr);
    case Node.VAR:
      const i = checkExpression(statement.init);
      if (!statement.typename) return i;

      const t = checkType(statement.typename);
      if (t !== i && t !== errorType)
        error(
          statement.init.pos,
          `Cannot assign initialiser of type '${typeToString(
            i
          )}' to variable with declared type '${typeToString(t)}'.`
        );
      return t;
    case Node.TYPEALIAS:
      return checkType(statement.typename);
  }
}

function checkExpression(expression: Expression): Type {
  switch (expression.kind) {
    case Node.ID:
      const symbol = resolve(module.locals, expression.text, Node.VAR);
      if (symbol) return checkStatement(symbol.valueDeclaration!);
      error(expression.pos, "Could not resolve " + expression.text);
      return errorType;
    case Node.NUMBERLITERAL:
      return numberType;
    case Node.ASSIGNMENT:
      const v = checkExpression(expression.value);
      const t = checkExpression(expression.name);
      if (t !== v)
        error(
          expression.value.pos,
          `Cannot assign value of type '${typeToString(
            v
          )}' to variable of type '${typeToString(t)}'.`
        );
      return t;
  }
}

function checkType(name: Identifier): Type {
  switch (name.text) {
    case "string":
      return stringType;
    case "number":
      return numberType;
    default:
      const symbol = resolve(module.locals, name.text, Node.TYPEALIAS);
      if (!symbol)
        return (
          error(name.pos, "Could not resolve type " + name.text), errorType
        );
      return checkType(
        (
          symbol.declarations.find(
            (d) => d.kind === Node.TYPEALIAS
          ) as TypeAlias
        ).typename
      );
  }
}

export function check(_module: Module) {
  module = _module;
  return _module.statements.map(checkStatement);
}
