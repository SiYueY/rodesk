import { expect, test, type Page } from '@playwright/test';

function captureErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('Agent call entry and end navigation work at narrow width', async ({ page }) => {
  const errors = captureErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('main', { name: 'Agent 对话' })).toBeVisible();
  await page.getByRole('button', { name: '打开通话' }).click();
  await expect(page).toHaveURL(/\/call$/);
  await expect(page.locator('.agent-call-page')).toBeVisible();
  await expect(page.locator('.agent-call-page').getByRole('button', { name: '返回' })).toHaveCount(
    0,
  );
  await page
    .locator('.call-media-video')
    .first()
    .evaluate((element) => {
      (window as Window & { __callVideo?: HTMLVideoElement }).__callVideo =
        element as HTMLVideoElement;
    });
  await page.getByRole('button', { name: '选择摄像头来源' }).click();
  await expect(page.getByRole('menu', { name: '摄像头来源' })).toBeVisible();
  await page.getByRole('button', { name: '麦克风' }).click();
  await expect(page.getByRole('menu', { name: '摄像头来源' })).toBeHidden();
  await page.getByRole('button', { name: '选择摄像头来源' }).click();
  await page.getByRole('button', { name: '摄像头', exact: true }).click();
  await expect(page.locator('.agent-call-page')).toHaveClass(/camera-off/);
  const scenario = await page.getByRole('button', { name: '选择情景' }).boundingBox();
  expect(scenario).not.toBeNull();
  expect(Math.abs(scenario!.x + scenario!.width / 2 - 195)).toBeLessThan(1);
  await expect(page.getByRole('menu', { name: '摄像头来源' })).toBeHidden();
  await page.getByRole('button', { name: '摄像头', exact: true }).click();
  await expect(page.locator('.agent-call-page')).not.toHaveClass(/camera-off/);
  await page.getByRole('button', { name: '结束通话' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('main', { name: 'Agent 对话' })).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  const releasedVideo = await page.evaluate(() => {
    const video = (window as Window & { __callVideo?: HTMLVideoElement }).__callVideo;
    return { paused: video?.paused, source: video?.querySelector('source')?.getAttribute('src') };
  });
  expect(releasedVideo).toEqual({ paused: true, source: null });
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});

test('Teleoperation still plays its mock camera and returns to Agent', async ({ page }) => {
  const errors = captureErrors(page);
  await page.goto('/teleoperation');
  await expect(page.locator('.teleoperation-page')).toBeVisible();
  const video = page.locator('.teleop-camera-player');
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: '返回' }).first().click();
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});
