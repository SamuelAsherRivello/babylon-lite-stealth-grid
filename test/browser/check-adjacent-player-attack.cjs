// Run with playwright-cli run-code --filename=test/browser/check-adjacent-player-attack.cjs.
async (page) => {
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    await page.goto(`http://localhost:5173/test/browser/adjacent-player-attack.html?dx=${dx}&dy=${dy}`);
    await page.waitForFunction(() => {
      const result = document.querySelector('#result')?.dataset.result;
      return result && JSON.parse(result).complete;
    });
    const result = await page.locator('#result').evaluate(node => JSON.parse(node.dataset.result));
    for (const row of result.rows) {
      const expected = row.character !== 'monk';
      if (row.firstAttack !== expected || row.movedDuringAttack || row.heals !== 0 || row.visibleLayers !== 1
        || (expected && row.starts < 2) || (!expected && row.starts !== 0)
        || (row.character === 'archer' && (row.shots < 2 || row.shots > row.starts))) {
        throw new Error(`Browser regression at ${dx},${dy}: ${JSON.stringify(row)}`);
      }
    }
    results.push(result);
    await page.locator('canvas').screenshot({ path: `.c056-browser-${dx}-${dy}.png` });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { passed: true, scenarios: 80, results: results.map(({ offset, rows }) => ({ offset,
    combatCases: rows.filter(row => row.character !== 'monk').length,
    minimumAttackStarts: Math.min(...rows.filter(row => row.character !== 'monk').map(row => row.starts)),
    monkAttacks: rows.filter(row => row.character === 'monk').reduce((sum, row) => sum + row.starts, 0),
  })) };
}
