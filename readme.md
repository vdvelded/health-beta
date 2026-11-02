# Health Quality

A small web app for health quality: sign in and see your open quality issues.

## Run

Requires Node.js 20 or later. No dependencies to install.

```sh
npm start          # http://localhost:3000 (set PORT to change)
npm test
```

## Pages

- `/login`: sign-in page.
- `/issues`: the signed-in user's open quality issues.

Demo accounts (seed data in `src/data.js`, kept in memory): `alice` / `alice123`, `bob` / `bob123`.
