// Run against the loaded bush-concealment.html fixture with playwright-cli run-code --filename.
async (page) => {
  await page.waitForFunction(() => {
    const data = document.querySelector('#result')?.dataset.result;
    return data && JSON.parse(data).complete;
  });
  const result = await page.locator('#result').evaluate(node => JSON.parse(node.dataset.result));
  for (const row of result.rows) {
    const shouldAttack = row.initialAwareness === 'ALERT' && row.character !== 'monk';
    if ((row.starts > 0) !== shouldAttack || row.afterExpiry || row.enteredProtectedBush
      || row.movedDuringAttack || (row.initialAwareness === 'ALERT' && row.awareness === 'ALERT')) {
      throw new Error(`Concealment regression: ${JSON.stringify(row)}`);
    }
  }
  await page.locator('canvas').screenshot({ path: 'output/playwright/c060-bush-concealment.png' });
  return { passed: true, scenarios: result.rows.length,
    attacksByState: Object.fromEntries(['NONE', 'INVESTIGATING', 'ALERT', 'EXPIRED'].map(state =>
      [state, result.rows.filter(row => row.initialAwareness === state).reduce((total, row) => total + row.starts, 0)])),
    attacksAfterExpiry: result.rows.reduce((total, row) => total + row.afterExpiry, 0) };
}
