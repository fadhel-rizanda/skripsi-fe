# Pawsitive Hub - Frontend (Next.js)

This repository contains the frontend web application for **Pawsitive Hub**, built with [Next.js](https://nextjs.org/) (App Router), TypeScript, and Tailwind CSS.

## Project Structure

```bash
.
├── actions/            # Server Actions (auth, API calls)
├── app/                # Next.js App Router (Pages & Layouts)
├── components/         # Reusable UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and libraries
├── middleware/         # Next.js middleware
├── public/             # Static assets (Images, Fonts, etc.)
├── schemas/            # Zod validation schemas
├── styles/             # Global styles (CSS)
└── types/              # Global TypeScript definitions
```

## Dependencies and Libraries

**Core Requirements**
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)

**Main Libraries**
- **Next.js (App Router) & React:** Core framework and UI library.
- **NextAuth:** Authentication and user authorization management.
- **Zustand:** Global state management for the frontend.
- **ShadCN/UI:** Provides pre-built UI components.
- **React Hook Form & Zod:** Type-safe form validation and handling.
- **Axios:** Promise-based HTTP client for making API requests.
- **Sonner:** Toast notification system.
- **Laravel Echo:** Receives real-time broadcasts from the Laravel backend.
- **@phosphor-icons/react:** Provides pre-built icons.
- **Tailwind CSS:** CSS framework.
- **Framer-motion:** Provides animations between UI elements.

## Quick Start

### Docker Setup
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd skripsi-fe
   ```

2. **Setup environment variables:**
   ```sh
   cp .env.example .env.local
   ```
   *Update `.env.local` with your backend API URLs. Note: Ensure `INTERNAL_API_URL` points to `http://app` inside the docker network.*

3. **Build and start the container:**
   ```sh
   docker-compose up -d --build
   ```
   *Note: The frontend container connects to the `skripsi-be_laravel` external network. Ensure the backend services are running first.*

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Manual Setup (Without Docker)

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd skripsi-fe
   ```

2. **Setup environment variables:**
   ```sh
   cp .env.example .env.local
   ```
   *Update `.env.local` with your backend API URLs if necessary.*

3. **Install dependencies:**
   ```sh
   pnpm install
   ```

4. **Run the development server:**
   ```sh
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
