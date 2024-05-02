import { Statement, Node } from "./types";
export function transform(statements: Statement[]) {
  return statements.flatMap(transformStatement);
}

function transformStatement(statement: Statement): Statement[] {
  switch (statement.kind) {
    case Node.EXPRESSION:
      return [statement];
    case Node.VAR:
      return [{ ...statement, typename: undefined }];
    case Node.TYPEALIAS:
      return [];
  }
}
