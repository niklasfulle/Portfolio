import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import * as ts from "typescript";

function isQueryCall(node: ts.Node): node is ts.CallExpression {
  return ts.isCallExpression(node)
    && ts.isPropertyAccessExpression(node.expression)
    && node.expression.name.text === "query";
}

test("auth audit and log sinks exclude passwords, tokens, MFA codes, and request payloads", async () => {
  const authSource = await readFile("lib/auth.ts", "utf8");
  const auditSchema = await readFile("sql/001_content_drafts.sql", "utf8");
  const sourceFile = ts.createSourceFile("auth.ts", authSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const auditCalls: ts.CallExpression[] = [];
  const directConsoleCalls: ts.CallExpression[] = [];
  const actionMaps: ts.Expression[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === "actionByPath"
      && node.initializer) {
      actionMaps.push(node.initializer);
    }

    if (isQueryCall(node)) {
      const query = node.arguments[0];
      const queryText = query && (ts.isStringLiteral(query) || ts.isNoSubstitutionTemplateLiteral(query))
        ? query.text
        : "";
      if (/INSERT\s+INTO\s+admin_audit_log/i.test(queryText)) auditCalls.push(node);
    }

    if (ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression)
      && node.expression.expression.text === "console") {
      directConsoleCalls.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  assert.equal(auditCalls.length, 3, "all auth audit insertions should be covered by this guard");
  assert.equal(directConsoleCalls.length, 0, "auth handlers should not directly log request or credential material");

  for (const call of auditCalls) {
    const query = call.arguments[0];
    assert.ok(query && (ts.isStringLiteral(query) || ts.isNoSubstitutionTemplateLiteral(query)));
    assert.match(
      query.text.replace(/\s+/g, " "),
      /INSERT INTO admin_audit_log\s*\(actor, action\)/i,
      "audit rows must contain only actor/action metadata",
    );

    const parameters = call.arguments[1];
    assert.ok(parameters && ts.isArrayLiteralExpression(parameters));
    assert.equal(parameters.elements.length, 2, "only actor and action parameters may be persisted");
    const actorExpression = parameters.elements[0].getText(sourceFile).replace(/\s+/g, "");
    assert.ok(
      ["\"unknown\"", "context.context.session?.user.id??\"unknown\"", "actor"].includes(actorExpression),
      `unexpected audit actor expression: ${actorExpression}`,
    );

    const action = parameters.elements[1];
    if (ts.isStringLiteral(action)) assert.match(action.text, /^auth\.[a-z_]+$/);
    else assert.ok(ts.isIdentifier(action) && action.text === "action", "audit action must come from the fixed action map");
  }

  assert.equal(actionMaps.length, 1, "auth audit actions should have one fixed allowlist");
  const actionMap = actionMaps[0];
  assert.ok(actionMap && ts.isObjectLiteralExpression(actionMap));
  for (const property of actionMap.properties) {
    assert.ok(ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer));
    assert.match(property.initializer.text, /^auth\.[a-z_]+$/);
  }

  const auditTable = auditSchema.match(/CREATE TABLE IF NOT EXISTS admin_audit_log\s*\(([\s\S]*?)\n\);/i)?.[1];
  assert.ok(auditTable, "base migration should declare the audit table");
  const columns = auditTable
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^([a-z_]+)\s+/i)?.[1])
    .filter((column): column is string => Boolean(column));
  assert.deepEqual(columns, ["id", "actor", "action", "created_at"]);
});
