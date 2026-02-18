```bash
bun install
bunx sst dev
curl --upload-file package.json https://cloudflare-hono-ajc-honoscript.anthonycampolo.workers.dev
```

https://cloudflare-hono-ajc-honoscript.anthonycampolo.workers.dev/

```bash
bunx sst deploy --stage production
curl --upload-file package.json https://cloudflare-hono-production-honoscript.anthonycampolo.workers.dev
```