# Deployment

Use GitHub Desktop with this folder:

```text
C:\Users\Michael T\Documents\GitHub\Mandarin-flashcards
```

Track these site files:

- `index.html`
- `styles.css`
- `app.js`
- `cards.js`
- `README.md`
- `DEPLOYMENT.md`
- `.nojekyll`
- `.gitignore`

Optional OCR backend files:

- `ocr-worker.js`
- `wrangler.toml`

Do not upload the photo/import/dictionary folders. They are ignored by `.gitignore`.

## Update Flow

1. Make edits here.
2. Open GitHub Desktop.
3. Review the changed files.
4. Commit to `main`.
5. Push origin.
6. Wait for GitHub Pages to redeploy.

GitHub Pages does not update from local edits alone. It updates after a commit is pushed to GitHub.

## OCR Backend

GitHub Pages cannot safely store API keys. For handwriting OCR:

1. Create a Cloudflare Workers project.
2. Use `ocr-worker.js` as the worker source.
3. Add an environment secret named `OPENAI_API_KEY`.
4. Optionally set `OPENAI_MODEL`; otherwise the worker uses `gpt-5.5`.
5. Deploy the worker and copy its public URL.
6. Open the flashcard site, tap `Writing Mode`, then `OCR Setup`, and paste the worker URL.

If you use Wrangler from this project folder:

```text
npm create cloudflare@latest mandarin-flashcards-ocr
```

Then replace the generated worker source with `ocr-worker.js`, set the secret, and deploy:

```text
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

The site sends only the handwriting canvas image and the expected answer to the worker. The worker returns whether OCR thinks the writing matches.
