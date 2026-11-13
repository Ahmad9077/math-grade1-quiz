# الرياضيات - الأول الابتدائي

A test-only practice site (no learn cards) for the second Grade 1 math short test (Wednesday 18 November 2026,
مدرسة مشرف الابتدائية بنات). The school card lists three lessons of unit 3 of the MOE book «الرياضيات»:

| Lesson | Book pages | Question styles (instruction lines copied from the paper) |
| --- | --- | --- |
| ٣-٢ عبارة الجمع | 108–109 | «اكتب عبارة الجمع.» under two groups, a rod of cubes or a ten-frame · «اجمع. استخدم خط الأعداد.» (the sentence above the line; the jumps are drawn after answering) · «أوجد الناتج.» with counters · the signs + and = · «ناتج الجمع» |
| ٣-٤ تكوين العددين ٤ و ٥ | 112–113 | «أكمل بيت العدد.» · «أكمل.» (missing number) · «أكمل مستعينا بالصورة.» · part-part-whole · «استكمل رسم العناصر. أكمل.» · «أوجد الناتج.» · any order · which sentence makes the number |
| ٣-٨ تكوين العدد ٩ | 120–121 | the same styles for 9, plus «لون لتكون العدد ٩» (which sentence fits the colouring) |

Sentences read right to left as in the book (the first number on the right); the number line runs left to right
(0 on the left); ten-frames and cube rods fill from the right. No sum goes above ten. No matching boards (the card
asks for none). Mock test: 10 questions (3 · 3 · 4). Every round picks other questions, other objects to count and
one of two spoken lines for each style.

Voice: Maryam (Kuwaiti), without diacritics: numbers, «زائد»، «يساوي»، short Kuwaiti questions for each style and
varied Kuwaiti cheers. Screen text has no diacritics. One copy for every child.

## Status
The first short test (28 October 2026) was published on 2026-10-27. This update replaces it; see the project note
in the Hub Manager memory for its release state.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4187
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows, sound and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /math-grade1-quiz/)
```

- Content, permanent question keys and the spoken lines: `src/data/catalog.ts`
- Pictures (sentences, pairs, cube rods, ten-frames, dominoes, number line, number houses, part-whole, colouring):
  `src/art/Art.tsx`
- Narration: `python3 scripts/generate-audio.py` (skips unchanged clips; `--only id --force` re-records a take),
  `python3 scripts/check-audio.py` (local Whisper transcription check)
- Hub seed: `npm run generate:hub-seed` → `integration/seed-math-grade1.sql` (also removes the first test's profiles)
