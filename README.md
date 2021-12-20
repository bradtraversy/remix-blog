# Remix Blog

This is the blog app from my [Remix Crash Course](https://youtu.be/d_BhzHVV4aQ) on YouTube

## Usage

Rename .envexample to .env and change session secret

Install dependencies

```sh
npm install
```

Load .env variables

```sh
npx prisma generate
```

Setup Database

```sh
npx prisma db push
```

Run dev server

```sh
npm run dev
```
