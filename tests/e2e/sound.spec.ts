import { expect, test, type Page } from '@playwright/test'
import { answer, start } from './helpers'

// The family's report of 8 November 2026: the sound worked on the page, but after leaving the
// browser and coming back it was gone. Safari on iPhone and iPad takes the sound away from a
// page that is left; here the page is "left" by hiding it and suspending its sound the same way.

type Played = { ctx: number; seconds: number; ended: boolean }
type Spy = { contexts: AudioContext[]; played: Played[] }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spy: Spy = { contexts: [], played: [] }
    ;(window as unknown as { __sound: Spy }).__sound = spy
    const Original = window.AudioContext
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options)
        spy.contexts.push(this)
      }
    }
    const startSource = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...args: Parameters<AudioBufferSourceNode['start']>) {
      // Only clips: the one-sample buffer that unlocks a context is not narration.
      if ((this.buffer?.duration ?? 0) > 0.2) {
        const entry: Played = { ctx: spy.contexts.indexOf(this.context as AudioContext), seconds: this.buffer!.duration, ended: false }
        spy.played.push(entry)
        this.addEventListener('ended', () => (entry.ended = true))
      }
      return startSource.apply(this, args)
    }
  })
})

const sound = (page: Page) =>
  page.evaluate(() => {
    const spy = (window as unknown as { __sound: Spy }).__sound
    return { states: spy.contexts.map((ctx) => ctx.state as string), played: spy.played.map((entry) => ({ ...entry })) }
  })

/** Leaves the page (another app, the home screen) and comes back, with the sound taken away meanwhile. */
async function leaveAndComeBack(page: Page) {
  await page.evaluate(async () => {
    const spy = (window as unknown as { __sound: Spy }).__sound
    const set = (state: 'hidden' | 'visible') => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => state === 'hidden' })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    set('hidden')
    await spy.contexts.at(-1)!.suspend()
    set('visible')
  })
}

test('the sound comes back with the first tap after leaving the browser', async ({ page }) => {
  await start(page)
  // The welcome line plays to its end.
  await expect.poll(async () => (await sound(page)).played.filter((p) => p.ended).length, { timeout: 15_000 }).toBeGreaterThan(0)

  await leaveAndComeBack(page)
  await page.locator('.topic-card').first().click()
  await expect.poll(async () => (await sound(page)).states, { timeout: 10_000 }).toEqual(['closed', 'running'])

  // Some questions have no spoken instruction (they copy the school's paper); a right answer is always cheered.
  const before = (await sound(page)).played.length
  await answer(page, true)
  await expect.poll(async () => (await sound(page)).played.slice(before).filter((p) => p.ctx === 1 && p.ended).length, { timeout: 15_000 }).toBeGreaterThan(0)
})

test('several trips away in a row leave one working context', async ({ page }) => {
  await start(page)
  for (let trip = 0; trip < 3; trip += 1) {
    await leaveAndComeBack(page)
    await page.locator('.home').click({ position: { x: 10, y: 10 } })
  }
  const { states } = await sound(page)
  expect(states.filter((state) => state !== 'closed')).toEqual(['running'])
})

// Safari on iPhone and iPad starts or wakes sound only inside a finished tap (touchend, the
// click after it, a key): not on the finger going down, and not later from a timer. Desktop
// test browsers are lenient, so these tests hold the page to that rule.
test.describe('under the iPhone and iPad rule for sound', () => {
  test.use({ hasTouch: true })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      let tapping = false
      const tap = () => {
        tapping = true
        window.setTimeout(() => (tapping = false), 0)
      }
      for (const name of ['touchend', 'click', 'keydown']) window.addEventListener(name, tap, { capture: true })
      window.addEventListener('pointerup', (event) => event.pointerType !== 'mouse' && tap(), { capture: true })
      const resume = AudioContext.prototype.resume
      AudioContext.prototype.resume = function (this: AudioContext) {
        return tapping ? resume.call(this) : Promise.reject(new DOMException('Sound starts only inside a tap.', 'NotAllowedError'))
      }
      const Strict = window.AudioContext
      window.AudioContext = class extends Strict {
        constructor(options?: AudioContextOptions) {
          super(options)
          if (!tapping) void this.suspend()
        }
      }
    })
  })

  test('the first tap after coming back brings the sound back', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /هيا نبدأ/ }).tap()
    await expect.poll(async () => (await sound(page)).played.filter((p) => p.ended).length, { timeout: 15_000 }).toBeGreaterThan(0)

    await leaveAndComeBack(page)
    await page.locator('.topic-card').first().tap()
    // The cheer after a right answer is said, to its end.
    const before = (await sound(page)).played.length
    await answer(page, true)
    await expect.poll(async () => (await sound(page)).played.slice(before).filter((p) => p.ended).length, { timeout: 15_000 }).toBeGreaterThan(0)
  })
})
