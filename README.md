# Robux Store - Next.js Application

Modern web application for selling Robux with crypto payments. Built with Next.js 14, Tailwind, Shadcn/UI, Prisma (PostgreSQL), and server-side authentication.

## Features
- **Authentication**: Custom JWT-based auth (Login/Register).
- **Dashboard**: User profile, order stats, and history.
- **Purchase Flow**: Real-time calculator, crypto selection, and payment handling.
- **Integrations**: Ready for RBXcrate (delivery) and NowPayments (crypto).
- **Responsive**: Mobile-first design.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon via Prisma)
- **UI**: TailwindCSS + Shadcn/UI
- **State**: Zustand (Client auth)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Update `.env` with your keys (Database URL is already set).

3. **Database**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Deployment
1. Push to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel dashboard.
4. Deploy.

## Project Structure
- `/app`: Pages and API routes.
- `/components`: UI components (Shadcn) and Custom components.
- `/lib`: Utilities (Auth, Database, Validators).
- `/prisma`: Database schema.
