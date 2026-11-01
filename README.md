This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Question-aware foundation (G01 development increment)

The offline inquiry contract retains explicit human questions, inferred interpretations, source spans, proposed links to existing claims, and human corrections. It does not yet run in the live extraction or viewer. See the [slice contract and acceptance criteria](.governance/slices/active/SLICE-G01-INQUIRY-FOUNDATION.md), [glossary](CONTEXT.md), and [synthetic fixture](tests/fixtures/inquiry-mixed.json).

With Node 22.18+:

```bash
npm ci --ignore-scripts
npm test
npm run demo:inquiry
```

Consumers call `parseInquiry(input, existingClaims)` from `src/lib/inquiry.ts`; failures throw `ZodError` with field paths. The caller supplies the matching orientation's claim IDs. There are no provider calls or persistence effects in this contract.

Independent review is pending. The branch `codex/g01-inquiry-foundation` is excluded from Vercel Git auto-deployments; this is not approval to merge or deploy.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
