# Souq Oman — ChatGPT assistant update

This update adds a ChatGPT shopping assistant button to the main header. The assistant can answer questions using a limited summary of up to 35 active marketplace listings. Existing Gemini functionality and marketplace components are left in place.

## Configure the OpenAI key

1. Create an OpenAI API key in the OpenAI developer platform. API usage is billed separately from a ChatGPT subscription. If you are under 18, ask a parent or guardian to help with the account and billing.
2. In Google AI Studio, open this app's **Secrets** panel and add `OPENAI_API_KEY` with the key as its value. Add `OPENAI_MODEL` as `gpt-4.1-mini` only if you want to set the model explicitly; otherwise the server uses that default.
3. Make sure `OPENAI_API_KEY` is configured as a server-side secret. Do not put it in frontend code, a `VITE_` variable, GitHub, or a public `.env` file.
4. Restart/redeploy the app after adding the secret.

## Run locally

```bash
npm install
cp .env.example .env
# Put your OPENAI_API_KEY in .env (never commit .env)
npm run dev
```

The app server serves the Vite frontend and the `/api/assistant` endpoint from the same origin. For production, run `npm run build` and then `npm start` with `NODE_ENV=production` and `OPENAI_API_KEY` configured in the hosting environment.

## Notes

- The API key is read only by `server.ts`; it is never sent to the browser.
- The assistant endpoint has basic per-IP rate limiting and caps conversation/listing context size.
- The assistant does not make purchases, reserve items, message sellers, or verify claims.
- Build verification could not be completed in this environment because dependencies were not installed (the package install timed out). Run `npm install`, then `npm run build` in your project environment.
