import { test, expect } from '@playwright/test';

test('should display the title and refresh button', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page.getByText('AI GitHub 热门项目推荐研究台')).toBeVisible();

  await expect(page.getByText('手动刷新')).toBeVisible();
});
