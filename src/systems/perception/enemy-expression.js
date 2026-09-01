export const ENEMY_EXPRESSIONS = Object.freeze({
  NONE: Object.freeze({ icon: null, flash: null }),
  SUSPICIOUS: Object.freeze({ icon: "?", flash: "white" }),
  INVESTIGATING: Object.freeze({ icon: "i", flash: "yellow" }),
  ALERT: Object.freeze({ icon: "!", flash: "red" }),
});

export const DEBUG_EXPRESSION_KEYS = Object.freeze({
  4: "NONE",
  5: "SUSPICIOUS",
  6: "INVESTIGATING",
  7: "ALERT",
});

export function getEnemyExpression(state) {
  return ENEMY_EXPRESSIONS[state] ?? ENEMY_EXPRESSIONS.NONE;
}

export function getDebugExpressionState(key) {
  return DEBUG_EXPRESSION_KEYS[String(key)] ?? null;
}
