import { expect, test, type Browser, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const baselineUrl = pathToFileURL(
  fileURLToPath(new URL('../../docs/agent/call/call.html', import.meta.url)),
).href;
const sizes = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];

async function openPair(
  browser: Browser,
  viewport: { width: number; height: number },
  isMobile = false,
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile,
    hasTouch: isMobile,
  });
  const baseline = await context.newPage();
  const vue = await context.newPage();
  await baseline.route('https://www.unitree.com/**', (route) => route.abort());
  await baseline.goto(baselineUrl, { waitUntil: 'domcontentloaded' });
  await baseline.locator('video source').evaluate((source) => {
    source.setAttribute('src', 'http://127.0.0.1:5187/media/unitree-camera-mock.mp4');
    (source.parentElement as HTMLVideoElement).load();
  });
  await vue.goto('/call');
  await expect(baseline.getByRole('button', { name: '返回' })).toHaveCount(0);
  await expect(vue.getByRole('button', { name: '返回' })).toHaveCount(0);
  return { context, baseline, vue };
}

async function freezeVideo(page: Page) {
  await page
    .locator('video')
    .first()
    .evaluate(async (video: HTMLVideoElement) => {
      if (video.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          video.addEventListener('loadeddata', () => resolve(), { once: true });
          video.addEventListener('error', () => reject(new Error('Video failed to load')), {
            once: true,
          });
        });
      }
      video.pause();
      if (Math.abs(video.currentTime - 2) > 0.02) {
        await new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
          video.currentTime = 2;
        });
      }
    });
}

async function compare(baseline: Page, vue: Page) {
  await freezeVideo(baseline);
  await freezeVideo(vue);
  const expected = PNG.sync.read(await baseline.screenshot({ animations: 'disabled' }));
  const actual = PNG.sync.read(await vue.screenshot({ animations: 'disabled' }));
  expect([actual.width, actual.height]).toEqual([expected.width, expected.height]);
  const changed = pixelmatch(
    expected.data,
    actual.data,
    undefined,
    expected.width,
    expected.height,
    { threshold: 0.2 },
  );
  expect(changed / (expected.width * expected.height)).toBeLessThan(0.015);
}

for (const viewport of sizes) {
  test(`default matches baseline at ${viewport.width}×${viewport.height}`, async ({ browser }) => {
    const { context, baseline, vue } = await openPair(browser, viewport);
    try {
      await compare(baseline, vue);
    } finally {
      await context.close();
    }
  });
}

for (const viewport of sizes.slice(0, 2)) {
  test(`mobile emulation matches baseline at ${viewport.width}×${viewport.height}`, async ({
    browser,
  }) => {
    const { context, baseline, vue } = await openPair(browser, viewport, true);
    try {
      await compare(baseline, vue);
    } finally {
      await context.close();
    }
  });
}

test('control states match the baseline', async ({ browser }) => {
  const { context, baseline, vue } = await openPair(browser, sizes[0]);
  const states = [
    ['#micButton', '[aria-label="麦克风"]'],
    ['#cameraButton', '[aria-label="摄像头"]'],
    ['#cameraButton', '[aria-label="摄像头"]'],
    ['#subtitleButton', '[aria-label="字幕"]'],
    ['#subtitleButton', '[aria-label="字幕"]'],
    ['#speakerButton', '[aria-label="扬声器"]'],
    ['#switchButton', '[aria-label="选择摄像头来源"]'],
    ['[data-camera="robot-arm"]', '.call-camera-source-item:nth-child(5)'],
    ['#moreButton', '[aria-label="更多"]'],
  ];
  try {
    await compare(baseline, vue);
    for (const [baselineSelector, vueSelector] of states) {
      await baseline.locator(baselineSelector).click();
      await vue.locator(vueSelector).click();
      await baseline.waitForTimeout(250);
      await compare(baseline, vue);
    }
    await baseline.locator('#sheetBackdrop').click({ position: { x: 10, y: 10 } });
    await vue.locator('.call-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await vue.locator('[aria-label="结束通话"]').click();
    await expect(vue).toHaveURL(/\/$/);
    await expect(vue.locator('.agent-call-page')).toHaveCount(0);
  } finally {
    await context.close();
  }
});
