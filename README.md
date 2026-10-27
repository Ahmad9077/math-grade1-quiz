# اللغة العربية - الأول الابتدائي

A test-only practice site (no learn cards) for the first Grade 1 Arabic test (Sunday 25 October 2026):
units 1 and 2, the letters from أ to ظ, and the six skills on the school's card.

| Lesson | Skill on the card |
| --- | --- |
| الحرف والصورة | 1. join a letter to its picture (choice questions and matching boards, letters first, on the right) · 3. the letter a picture starts with |
| الحرف في الكلمة | 2. circle the letter in the word (tap it; letters keep their joined shapes) |
| شكل الحرف | 4. complete a word with the right letter shape (start, middle, end) |
| تركيب الكلمة | 5. build a word from letters with short vowels |
| نسخ الحرفين | 6. copy two letters (find the same pair among look-alikes) |

Mock test: 12 questions (4 letter-and-picture, 2 from each other lesson).

Voices: letters, words and blended words in Modern Standard Arabic with full diacritics (Layla, the approved
Arabic phonics voice) so ظ/ض, ذ/ز and ث/س keep their sounds; instructions and cheers in Kuwaiti (Maryam).
Screen text has no diacritics except the short vowels being learned. One copy for every child.

## Status
Preview only (22 October 2026): not published, not connected to the Hub, not assigned to any account.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4187
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /math-grade1-quiz/)
```

- Content, permanent question keys and Arabic letter shapes: `src/data/catalog.ts`
- Narration: `python3 scripts/generate-audio.py` (skips unchanged clips; `--only id --force` re-records a take),
  `python3 scripts/check-audio.py` (transcription check). Very short words are best checked in context.
- Hub seed: `npm run generate:hub-seed` → `integration/seed-math-grade1.sql`
