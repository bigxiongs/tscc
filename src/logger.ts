import { TModule } from "./ast";
import { Token, duplicateSymbols, keywords, symbols } from "./token";
import printf from "printf";
import { emit } from "./emit";

// let level: number;

// const say = (format: string, ...args: any[]) => {
//   let p = printf(format, ...args);
//   for (let i = 0; i < level; i++) p = "  " + p;
//   return p;
// };

const title = (str: string) => console.log("\x1b[1m%s\x1b[0m", str);
const log = console.log;
const dumpToken = (token: Token, lexeme: string, pos: number) => {
  if (lexeme in symbols || lexeme in duplicateSymbols || lexeme in keywords)
    console.log(printf("%4d: [%s]", pos, token));
  else console.log(printf("%4d: [%s] %s", pos, token, lexeme));
};

const dumpAst = (tree: TModule) => console.log(emit(tree.statements));

// const dumpStatements = (stmts: TStatement[]) =>
//   stmts
//     .map(dumpStatement)
//     .filter((s) => s != "")
//     .join("\n");

// const dumpStatement = (stmt: TStatement): string => {
//   let p1, p2, p3;
//   switch (stmt.kind) {
//     case AST.IF:
//       p1 = say("if (%s) {\n", dumpExpr(stmt.cond));
//       level++;
//       p2 = dumpStatements(stmt.thenn) + "\n";
//       level--;
//       p3 = say("}");
//       if (stmt.elsee.length > 0) {
//         p3 += " else {\n";
//         level++;
//         p3 += dumpStatements(stmt.elsee) + "\n";
//         level--;
//         p3 += say("}");
//       }
//       return p1 + p2 + p3;
//     case AST.WHILE:
//       p1 = say("while (%s) {\n", dumpExpr(stmt.cond));
//       level++;
//       p2 = dumpStatements(stmt.body) + "\n";
//       level--;
//       p3 = say("}");
//       return p1 + p2 + p3;
//     case AST.RETURN:
//       return say("return %s;", dumpExpr(stmt.value));
//     // case AST.DECL:
//     case AST.VAR:
//       return say("var %s;", dumpVar(stmt));
//     case AST.LET:
//       p1 = say("let %s", dumpExpr(stmt.id));
//       p2 = ";";
//       if (stmt.value) p2 = " = " + dumpExpr(stmt.value) + p2;
//       return p1 + p2;
//     case AST.CONST:
//       p1 = say("const %s", dumpExpr(stmt.id));
//       p2 = " = " + dumpExpr(stmt.value) + ";";
//       return p1 + p2;
//     case AST.FUNCTION:
//       return dumpFunction(stmt);
//     case AST.TYPE:
//       return "";
//     // case AST.EXPR:
//     default:
//       return dumpExpr(stmt);
//   }
// };

// const dumpVar = (stmt: TVar): string => {
//   let p1 = printf("%s", dumpExpr(stmt.id));
//   if (!stmt.value) return p1;
//   return p1 + " = " + dumpExpr(stmt.value);
// };

// const dumpProp = (stmt: TVar): string => {
//   let p1 = printf("%s", stmt.id.id);
//   if (!stmt.value) return p1;
//   return say(p1 + ": " + dumpExpr(stmt.value));
// };

// const dumpExpr = (expr: TExpr): string => {
//   switch (expr.kind) {
//     case AST.ELE:
//       if (expr.obj.kind == AST.ID)
//         return printf("%s[%s]", dumpExpr(expr.obj), dumpExpr(expr.index));
//       return printf("(%s)[%s]", dumpExpr(expr.obj), dumpExpr(expr.index));
//     case AST.BOP:
//       return printf(
//         "%s %s %s",
//         dumpExpr(expr.left),
//         expr.op,
//         dumpExpr(expr.right)
//       );
//     case AST.UOP:
//       return printf("%s %s", expr.op, dumpExpr(expr.exp));
//     case AST.CALL:
//       if (expr.funcid.kind == AST.ID)
//         return printf(
//           "%s(%s)",
//           dumpExpr(expr.funcid),
//           expr.args.map(dumpExpr).join(", ")
//         );
//       return printf(
//         "(%s)(%s)",
//         dumpExpr(expr.funcid),
//         expr.args.map(dumpExpr).join(", ")
//       );
//     case AST.PROP:
//       if (expr.obj.kind == AST.ID)
//         return printf("%s.%s", dumpExpr(expr.obj), dumpExpr(expr.prop));
//       return printf("(%s).%s", dumpExpr(expr.obj), dumpExpr(expr.prop));
//     case AST.FALSE:
//       return printf("false");
//     case AST.TRUE:
//       return printf("true");
//     case AST.THIS:
//       return printf("this");
//     case AST.NEW:
//       if (expr.funcid.kind == AST.ID)
//         return printf(
//           "new %s(%s)",
//           dumpExpr(expr.funcid),
//           expr.args.map(dumpExpr).join(", ")
//         );
//       return printf(
//         "new (%s)(%s)",
//         dumpExpr(expr.funcid),
//         expr.args.map(dumpExpr).join(", ")
//       );
//     case AST.ID:
//       return printf("%s", expr.id);
//     case AST.NUM:
//       return printf("%d", expr.value);
//     case AST.ASSIGN:
//       return printf("%s = %s", expr.id.id, dumpExpr(expr.value));
//     case AST.ARRAYASSIGN:
//       return printf("%S = %s", dumpExpr(expr.ele), dumpExpr(expr.value));
//     case AST.PROPASSIGN:
//       return printf("%s = %s", dumpExpr(expr.prop), dumpExpr(expr.value));
//     case AST.LIST:
//       return printf("(%s)", expr.list.map(dumpExpr).join(", "));
//     case AST.FUNCEXP:
//       return dumpFunction(expr);
//     case AST.OBJ:
//       return dumpObj(expr);
//   }
// };

// const dumpFunction = (func: TFunction | TFuncExp) => {
//   let p1 = say(
//     "function %s(%s) {\n",
//     func.id ? dumpExpr(func.id) : "",
//     func.args.map(dumpVar).join(", ")
//   );
//   level++;
//   let p2 = dumpStatements(func.body) + "\n";
//   level--;
//   let p3 = say("}");
//   return p1 + p2 + p3;
// };

// const dumpObj = (obj: TObj) => {
//   if (obj.props.length == 0) return "{}";
//   let p1 = say("{\n");
//   level++;
//   let p2 = obj.props.map(dumpProp).join(",\n") + "\n";
//   level--
//   return p1 + p2 + say("}")
// };

const logger = { title, log, dumpToken, dumpAst };

export { logger };
