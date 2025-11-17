# Next.js Multi-Tenant Example

A production-ready example of a multi-tenant application built with Next.js 15, featuring custom subdomains for each tenant.

## Features

- ✅ Custom subdomain routing with Next.js middleware
- ✅ Tenant-specific content and pages
- ✅ Shared components and layouts across tenants
- ✅ PostgreSQL for tenant data storage
- ✅ Admin interface for managing tenants
- ✅ Emoji support for tenant branding
- ✅ Support for local development with subdomains
- ✅ Compatible with Vercel preview deployments

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/) for data storage
- [Tailwind 4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for the design system

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- PostgreSQL 14+ (local install or Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vercel/platforms.git
   cd platforms
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file for running `pnpm dev` directly on your machine:

     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/platforms?schema=public"
     ```

   - Review `.env.docker` (already checked into the repo) for the values containers will use. Adjust the credentials there if you need something other than the default `postgres/postgres`.

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Access the application:
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Tenants: http://[tenant-name].localhost:3000

### Keeping the database in sync

- Local host workflow: `pnpm db:push` (or `pnpm db:migrate`) will use the `DATABASE_URL` from `.env.local`.
- Docker workflow: `docker compose -f docker-compose.dev.yml exec app pnpm db:push` runs the same command inside the container so it can reach the `db` service.
- Production/staging: run the same command against the appropriate environment variables before deploying.

### Environment files

- `.env.local` – developer-specific values when running `pnpm dev` on the host machine. Point `DATABASE_URL` to whatever PostgreSQL instance you use locally (often `localhost`).
- `.env.docker` – defaults consumed by `docker-compose*.yml`. Containers connect to the internal `db` service by default, so you normally don’t need to change this unless you’re pointing Compose at an external database.
- `.env.production` – optional file for production/staging deployments if you use `docker-compose --profile prod …`.

## Multi-Tenant Architecture

This application demonstrates a subdomain-based multi-tenant architecture where:

- Each tenant gets their own subdomain (`tenant.yourdomain.com`)
- The middleware handles routing requests to the correct tenant
- Tenant data is stored in PostgreSQL using a simple `Tenant` table
- The main domain hosts the landing page and admin interface
- Subdomains are dynamically mapped to tenant-specific content

The middleware (`middleware.ts`) intelligently detects subdomains across various environments (local development, production, and Vercel preview deployments).

## Deployment

This application is designed to be deployed on Vercel. To deploy:

1. Push your repository to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

For custom domains, make sure to:

1. Add your root domain to Vercel
2. Set up a wildcard DNS record (`*.yourdomain.com`) on Vercel
