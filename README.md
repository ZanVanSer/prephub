# ToolHub

ToolHub is a unified Next.js workspace that integrates `Image Prep` and `MJ Tool` into one authenticated shell.

## Setup

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build and verify:

```bash
npm run build
npm run lint
```

## Required environment variables

ToolHub reuses the Supabase auth/storage approach from Image Prep. Set these in your environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=imprep-assets
```

If the public Supabase variables are missing, the login screen shows a setup state instead of opening the workspace.
