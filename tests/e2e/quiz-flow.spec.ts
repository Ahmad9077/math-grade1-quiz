import { expect, test, type Page } from '@playwright/test'
import { TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_SIZE } from '../../src/domain/round'
import { answer, noHorizontalScroll, start } from './helpers'

const keyOnScreen = async (page: Page) => (await page.locator('section.question').last().getAttribute('data-question-key'))!

test('home lists the three lessons of the card and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(3)
  await expect(page.locator('.topic-card-lesson')).toHaveText(['درس ٣-٢', 'درس ٣-٤', 'درس ٣-٨'])
  await expect(page.locator('.topic-card-title')).toHaveText(TOPICS.map((t) => t.title))
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test('a lesson starts its questions straight away (a test only, no learn cards)', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="make9"]').click()
  await expect(page.locator('section.question')).toBeVisible()
  await expect(page.locator('.learn-card, .mode-card')).toHaveCount(0)
})

test('a full round of «عبارة الجمع» gives feedback, stars and a review of misses', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="sentence"]').click()
  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const correct = n !== 2 && n !== 5
    await answer(page, correct)
    await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
    if (!correct) await expect(page.locator('.option.is-reveal')).toHaveCount(1)
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.results-card')).toBeVisible()
  await expect(page.locator('.results-number')).toHaveText('٦')
  await expect(page.locator('.review-item')).toHaveCount(2)
  await page.getByRole('button', { name: /الدروس/ }).click()
  await expect(page.locator('.topic-card[data-topic="sentence"] .star-icon.is-filled')).toHaveCount(2)
})

test('reads like the book: sentences from the right, the number line from the left', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  let sentences = 0
  let lines = 0
  for (let round = 0; round < 4 && (sentences === 0 || lines === 0); round += 1) {
    await page.locator('.topic-card[data-topic="sentence"]').click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      const section = page.locator('section.question').last()
      const sentence = section.locator('.art-sentence').first()
      if (await sentence.count()) {
        // The first number of «أ + ب = ج» stands on the right.
        const cells = sentence.locator('.sent-num')
        const [first, last] = await Promise.all([cells.first().boundingBox(), cells.last().boundingBox()])
        expect(first!.x).toBeGreaterThan(last!.x)
        sentences += 1
      }
      const jump = section.locator('.art-jump')
      if (await jump.count()) {
        // Zero on the left, the jumps go right.
        const ticks = await jump.locator('text').allTextContents()
        expect(ticks[0]).toBe('٠')
        const xs = await jump.locator('text').evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute('x'))))
        expect(xs[0]).toBeLessThan(xs.at(-1)!)
        expect(await jump.evaluate((node) => getComputedStyle(node).transform)).toBe('none')
        lines += 1
      }
      await answer(page, true)
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
  }
  expect(sentences).toBeGreaterThan(0)
  expect(lines).toBeGreaterThan(0)
})

test('the mock test mixes the three lessons', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.test-banner').click()
  const topics = new Set<string>()
  for (let n = 0; n < TEST_SIZE; n += 1) {
    const question = await answer(page, true)
    topics.add(question.topic)
    await page.locator('.next-button').click()
  }
  expect(topics.size).toBe(3)
  await expect(page.locator('.results-number')).toHaveText('١٠')
})

test('every lesson fits the screen, including the houses and the number line', async ({ page }) => {
  test.setTimeout(180_000)
  await start(page)
  for (const topic of TOPICS.map((t) => t.id)) {
    await page.locator(`.topic-card[data-topic="${topic}"]`).click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      const key = await keyOnScreen(page)
      expect(key.startsWith(`${topic}:`), key).toBe(true)
      await noHorizontalScroll(page)
      // Every choice is on screen without scrolling sideways.
      for (const box of await page.locator('section.question .option').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().right))) {
        expect(box).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth) + 1)
      }
      await answer(page, true)
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
  }
})
