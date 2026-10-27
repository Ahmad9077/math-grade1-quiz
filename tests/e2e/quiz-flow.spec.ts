import { expect, test } from '@playwright/test'
import { QUESTIONS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_SIZE } from '../../src/domain/round'
import { answer, noHorizontalScroll, start } from './helpers'

test('home lists the five lessons and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(5)
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test('a lesson starts its questions straight away (a test only, no learn cards)', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="clock"]').click()
  await expect(page.locator('section.question')).toBeVisible()
  await expect(page.locator('.learn-card, .mode-card')).toHaveCount(0)
})

test('a full round of the clock gives feedback, stars and a review of misses', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="clock"]').click()
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
  await expect(page.locator('.topic-card[data-topic="clock"] .star-icon.is-filled')).toHaveCount(2)
})

test('comparing: the signs keep the book order and are never mirrored', async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="compare"]').click()
  for (let n = 0; n < 4; n += 1) {
    const key = await page.locator('section.question').last().getAttribute('data-question-key')
    const question = QUESTIONS.find((q) => q.key === key)!
    if (question.fixedOrder) {
      const signs = await page.locator('section.question .option .art-sign').allTextContents()
      expect(signs).toEqual(['>', '=', '<'])
      // Laid out left to right whatever the page direction.
      const boxes = await page.locator('section.question .art-compare').first().evaluate((node) => getComputedStyle(node).direction)
      expect(boxes).toBe('ltr')
    }
    await answer(page, true)
    await page.locator('.next-button').click()
  }
})

test('the matching board starts from the groups and joins pairs with lines', async ({ page }) => {
  test.setTimeout(180_000)
  await start(page)
  let boards = 0
  // Practice rounds are shuffled; play until a board comes up.
  for (let round = 0; round < 6 && boards === 0; round += 1) {
    await page.locator('.topic-card[data-topic="count"]').click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      const key = await page.locator('section.question').last().getAttribute('data-question-key')
      const isBoard = QUESTIONS.find((q) => q.key === key)?.kind === 'match'
      if (isBoard) {
        // The numbers answer the groups: tapping a number first only points back to the groups.
        await page.locator('section.question .match-second').first().click()
        await expect(page.locator('section.question .match-column-first.nudge')).toHaveCount(1)
        await expect(page.locator('section.question .match-item.is-selected, section.question .match-item.shake')).toHaveCount(0)
        // Groups stand on the right, where Arabic reading starts.
        const [first, second] = await Promise.all([
          page.locator('section.question .match-first').first().boundingBox(),
          page.locator('section.question .match-second').first().boundingBox(),
        ])
        expect(first!.x).toBeGreaterThan(second!.x)
        boards += 1
      }
      await answer(page, !isBoard || boards > 1)
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
  }
  expect(boards).toBeGreaterThanOrEqual(1)
})

test('the mock test mixes all five lessons', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.test-banner').click()
  const topics = new Set<string>()
  for (let n = 0; n < TEST_SIZE; n += 1) {
    const question = await answer(page, true)
    topics.add(question.topic)
    await page.locator('.next-button').click()
  }
  expect(topics.size).toBe(5)
  await expect(page.locator('.results-number')).toHaveText('١٢')
})

test('every lesson fits the screen, including the long number trains', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  for (const topic of ['count', 'order', 'compare', 'clock', 'calendar']) {
    await page.locator(`.topic-card[data-topic="${topic}"]`).click()
    for (let n = 0; n < 4; n += 1) {
      await answer(page, true)
      await noHorizontalScroll(page)
      await page.locator('.next-button').click()
    }
    await page.locator('.round-button').first().click()
    await page.getByRole('button', { name: 'خروج' }).last().click()
  }
})
