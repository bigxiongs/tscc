import { AST, TExpr, TFuncExp, TFunction, TObj, TStatement, TVar } from "./ast";
import printf from "printf";

export const emit = (statements: TStatement[]) => {
  return emitStatements(statements);
};

let level: number;

const indent = (format: string, ...args: any[]) => {
  let p = printf(format, ...args);
  for (let i = 0; i < level; i++) p = "  " + p;
  return p;
};

const emitStatements = (stmts: TStatement[]) => (
  (level = 0),
  stmts
    .map(emitStatement)
    .filter((s) => s != "")
    .join("\n")
);

const emitStatement = (stmt: TStatement): string => {
  let p1, p2, p3;
  switch (stmt.kind) {
    case AST.IF:
      p1 = indent("if (%s) {\n", emitExpr(stmt.cond));
      level++;
      p2 = emitStatements(stmt.thenn) + "\n";
      level--;
      p3 = indent("}");
      if (stmt.elsee.length > 0) {
        p3 += " else {\n";
        level++;
        p3 += emitStatements(stmt.elsee) + "\n";
        level--;
        p3 += indent("}");
      }
      return p1 + p2 + p3;
    case AST.WHILE:
      p1 = indent("while (%s) {\n", emitExpr(stmt.cond));
      level++;
      p2 = emitStatements(stmt.body) + "\n";
      level--;
      p3 = indent("}");
      return p1 + p2 + p3;
    case AST.RETURN:
      return indent("return %s;", emitExpr(stmt.value));
    // case AST.DECL:
    case AST.VAR:
      return indent("var %s;", emitVar(stmt));
    case AST.LET:
      p1 = indent("let %s", emitExpr(stmt.id));
      p2 = ";";
      if (stmt.value) p2 = " = " + emitExpr(stmt.value) + p2;
      return p1 + p2;
    case AST.CONST:
      p1 = indent("const %s", emitExpr(stmt.id));
      p2 = " = " + emitExpr(stmt.value) + ";";
      return p1 + p2;
    case AST.FUNCTION:
      return emitFunction(stmt);
    case AST.TYPE:
      return "";
    // case AST.EXPR:
    default:
      return emitExpr(stmt) + ";";
  }
};

const emitVar = (stmt: TVar): string => {
  let p1 = printf("%s", emitExpr(stmt.id));
  if (!stmt.value) return p1;
  return p1 + " = " + emitExpr(stmt.value);
};

const emitProp = (stmt: TVar): string => {
  let p1 = printf("%s", stmt.id.id);
  if (!stmt.value) return indent(p1);
  return indent(p1 + ": " + emitExpr(stmt.value));
};

const emitExpr = (expr: TExpr): string => {
  switch (expr.kind) {
    case AST.ELE:
      if (expr.obj.kind == AST.ID)
        return printf("%s[%s]", emitExpr(expr.obj), emitExpr(expr.index));
      return printf("(%s)[%s]", emitExpr(expr.obj), emitExpr(expr.index));
    case AST.BOP:
      return printf(
        "%s %s %s",
        emitExpr(expr.left),
        expr.op,
        emitExpr(expr.right)
      );
    case AST.UOP:
      return printf("%s %s", expr.op, emitExpr(expr.exp));
    case AST.CALL:
      if (expr.funcid.kind == AST.ID)
        return printf(
          "%s(%s)",
          emitExpr(expr.funcid),
          expr.args.map(emitExpr).join(", ")
        );
      return printf(
        "(%s)(%s)",
        emitExpr(expr.funcid),
        expr.args.map(emitExpr).join(", ")
      );
    case AST.PROP:
      if (expr.obj.kind == AST.ID)
        return printf("%s.%s", emitExpr(expr.obj), emitExpr(expr.prop));
      return printf("(%s).%s", emitExpr(expr.obj), emitExpr(expr.prop));
    case AST.FALSE:
      return printf("false");
    case AST.TRUE:
      return printf("true");
    case AST.UNDEFINED:
      return printf("undefined");
    case AST.THIS:
      return printf("this");
    case AST.NEW:
      if (expr.funcid.kind == AST.ID)
        return printf(
          "new %s(%s)",
          emitExpr(expr.funcid),
          expr.args.map(emitExpr).join(", ")
        );
      return printf(
        "new (%s)(%s)",
        emitExpr(expr.funcid),
        expr.args.map(emitExpr).join(", ")
      );
    case AST.ID:
      return printf("%s", expr.id);
    case AST.NUM:
      return printf("%d", expr.value);
    case AST.ASSIGN:
      return printf("%s = %s", expr.id.id, emitExpr(expr.value));
    case AST.ARRAYASSIGN:
      return printf("%S = %s", emitExpr(expr.ele), emitExpr(expr.value));
    case AST.PROPASSIGN:
      return printf("%s = %s", emitExpr(expr.prop), emitExpr(expr.value));
    case AST.LIST:
      return printf("(%s)", expr.list.map(emitExpr).join(", "));
    case AST.FUNCEXP:
      return emitFunction(expr);
    case AST.OBJ:
      return emitObj(expr);
  }
};

const emitFunction = (func: TFunction | TFuncExp) => {
  let p1 = indent(
    "function %s(%s) {\n",
    func.id ? emitExpr(func.id) : "",
    func.args.map(emitVar).join(", ")
  );
  level++;
  let p2 = emitStatements(func.body) + "\n";
  level--;
  let p3 = indent("}");
  return p1 + p2 + p3;
};

const emitObj = (obj: TObj) => {
  if (obj.props.length == 0) return "{}";
  let p1 = indent("{\n");
  level++;
  let p2 = obj.props.map(emitProp).join(",\n") + "\n";
  level--;
  return p1 + p2 + indent("}");
};
