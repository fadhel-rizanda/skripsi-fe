# Next Setup Project

## Project Structure
```bash
.
├── app/                # Next.js App Router
├── actions/            # Server Actions (auth, API calls)
├── components/         # Reusable UI components
├── lib/                # Utility functions and libraries
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── middleware/         # Next.js middleware
├── schemas/            # Zod validation schemas
├── types/              # Global TypeScript definitions
├── public/             # Static assets
├── styles/             # Global styles
├── .env.example        # Environment variables example
├── package.json
└── README.md
```

## Install pnpm
```bash
npm install -g pnpm
```

## Quick Start

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <your-project-directory>
   ```
2. **Copy the environment file:**
   ```sh
   cp .env.example .env.local
   ```
   
3. **Install dependencies:**
   ```bash
    pnpm install
    ```

4. **Run project:**
   ```sh
   pnpm dev
   ```

## Flow push project
```bash
git checkout development
git pull
# kerjain
  pnpm lint --fix # untuk memperbaiki format kode otomatis, pastiin kg ada error/warning
git checkout -b feat/nama_fitur
git add .
git commit -m “deskripsi”
git push origin feat/nama_fitur
# buat pull request ke development
```