# Taiwan Mandarin Flashcards

A standalone mobile-friendly flashcard site for Mandarin writing and sentence practice. The current photo-based deck has 178 cards.

## Open It

Open `index.html` in a browser.

If your browser still shows an older sample deck, open `Edit` and tap `Reset Deck`.

## Edit Cards

Use the `Edit` button in the site and paste one card per line:

```text
Traditional | Simplified | Pinyin | Meaning | Sentence Traditional | Sentence Simplified | Sentence Pinyin | Sentence English | Category
```

Example:

```text
競爭 | 竞争 | jìngzhēng | competition; to compete | 這個市場競爭很激烈。 | 这个市场竞争很激烈。 | Zhège shìchǎng jìngzhēng hěn jīliè. | This market is very competitive. | Business
```

Your edited cards are saved in the browser on that device.

## Audio

Use `Play Word` or `Play Sentence` on each card. The site uses the browser's built-in speech voice and prefers `zh-TW` when available.

## Writing Mode

Use `Writing Mode` to practice from the English prompt on a finger/stylus canvas.

Use `Reveal Answer` when you want to compare your writing, `Try Again` to clear the canvas, and `Correct` when you want to mark the card as right.

Keyboard shortcuts:

- `W`: play word
- `S`: play sentence
- `D`: switch default side between Chinese first and English first
- `P`: show or hide sentence pinyin
- `M`: show or hide writing mode
- `F`: flip card
- Left/right arrows: previous/next card

## Phone Use

The layout is responsive for phone screens. For the easiest phone workflow, put these files on a static host or a synced folder you can open from your phone:

- `index.html`
- `styles.css`
- `cards.js`
- `app.js`

The current deck is stored in `cards.js`.
