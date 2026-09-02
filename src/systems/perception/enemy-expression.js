export const ENEMY_EXPRESSIONS = Object.freeze({
  NONE: Object.freeze({ icon: null, flash: null }),
  SUSPICIOUS: Object.freeze({ icon: "?", flash: "white" }),
  INVESTIGATING: Object.freeze({ icon: "i", flash: "yellow" }),
  ALERT: Object.freeze({ icon: "!", flash: "red" }),
});

export function getEnemyExpression(state) {
  return ENEMY_EXPRESSIONS[state] ?? ENEMY_EXPRESSIONS.NONE;
}
