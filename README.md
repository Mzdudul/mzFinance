# mzFinance - Financial Management Application

A modern, production-ready financial management SaaS application built with React, TypeScript, Vite, Supabase, and Tailwind CSS.

## Features

- **Secure Authentication**: Google OAuth 2.0 and Apple Sign-In
- **Transaction Management**: Track income and expenses with detailed categorization
- **Visual Analytics**: Charts and graphs of financial data
- **Budget Categories**: Organize transactions by custom categories
- **Multi-Currency Support**: Work with different currencies
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Glassmorphism design with dark mode support
- **Fast Performance**: Built with Vite for fast development and production builds
- **Real-time Updates**: Powered by Supabase real-time capabilities

## Architecture

### Technology Stack

**Frontend:**
- React 18.3
- TypeScript 5.8
- Vite 5.4
- Tailwind CSS 3.4
- Shadcn UI Components
- React Router 6
- Framer Motion (animations)
- React Hook Form (forms)
- React Query (data fetching)
- Recharts (data visualization)

**Backend & Database:**
- Supabase (PostgreSQL, Auth, Real-time)
- OAuth 2.0 (Google & Apple via Supabase)

**Development Tools:**
- ESLint & TypeScript ESLint
- Vitest (testing framework)
- PostCSS & Autoprefixer

### Project Structure

```
src/
├── pages/              # Page components
│   ├── LoginPage.tsx   # OAuth login
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── CategoriesPage.tsx
│   └── SettingsPage.tsx
├── components/         # Reusable React components
│   ├── ui/            # Shadcn UI components
│   ├── AppLayout.tsx
│   └── NavLink.tsx
├── contexts/           # React Context
│   └── AuthContext.tsx # Authentication state
├── integrations/       # External services
│   └── supabase/
│       ├── client.ts   # Supabase client
│       ├── auth.ts     # OAuth utilities
│       └── types.ts    # Database types
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Images and static files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- npm, yarn, or bun package manager
- Supabase account (free at https://supabase.com)
- Google Cloud account (for OAuth)
- Apple Developer account (for Sign-In with Apple)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd purple-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials (see [OAuth Setup Guide](./OAUTH_SETUP.md))

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

## 🔐 Authentication Setup

Complete OAuth setup is required for the application to function. Follow the comprehensive guide in [OAUTH_SETUP.md](./OAUTH_SETUP.md) which includes:

- **Google OAuth Configuration**: Step-by-step Google Cloud Console setup
- **Apple Sign-In Configuration**: Apple Developer and Supabase configuration
- **Environment Variables**: Required credentials and their locations
- **Testing**: How to test OAuth flows locally
- **Troubleshooting**: Common issues and solutions
- **Production Deployment**: Configuring OAuth for production

For a detailed explanation of all changes made from the original Lovable scaffold, see [MIGRATION.md](./MIGRATION.md).

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run lint            # Run ESLint
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode

# Production
npm run build           # Build for production
npm run build:dev       # Build in development mode
npm run preview         # Preview production build locally
```

## 🔄 Complete Independence from Lovable

This project has been completely refactored to be independent:

### Removed Components
- `@lovable.dev/cloud-auth-js` dependency
- `lovable-tagger` dev dependency
- `.lovable/` configuration directory
- All Lovable integration code
- Lovable-specific wrappers and middleware

### Direct Integrations
- Direct Supabase OAuth implementation
- Native authentication context
- Production-ready error handling
- Proper redirect URI configuration
- No third-party framework dependencies

## 🗂️ Supabase Database Schema

### Tables
- **users** (Supabase built-in)
- **profiles** - User preferences and settings
- **transactions** - Income and expense records
- **categories** - Transaction categories

### Column Details

**profiles**
- `user_id` (uuid, PK)
- `first_name` (text)
- `last_name` (text)
- `avatar_url` (text)
- `preferred_currency` (text, default: 'BRL')
- `updated_at` (timestamp)

**transactions**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `category_id` (uuid, FK)
- `amount` (decimal)
- `type` (enum: 'income' | 'expense')
- `description` (text)
- `date` (date)
- `created_at` (timestamp)

**categories**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text)
- `icon` (text)
- `color` (text)
- `created_at` (timestamp)

## 🧪 Testing

The project uses Vitest for unit and integration testing.

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check test file example
cat src/test/example.test.ts
```

## 📝 OAuth Flow Explanation

### Google OAuth Flow
1. User clicks "Continuar com Google"
2. Redirected to Google login
3. User authenticates with Google
4. Google redirects to Supabase callback
5. Supabase handles token exchange and creates/updates user
6. User redirected back to app with session
7. AuthContext updates and user is logged in

### Apple Sign-In Flow
1. User clicks "Continuar com Apple"
2. Redirected to Apple login
3. User authenticates with Apple
4. Apple redirects to Supabase callback
5. Supabase handles token exchange and creates/updates user
6. User redirected back to app with session
7. AuthContext updates and user is logged in

## 🚨 Troubleshooting

### OAuth Issues
- **404 on Callback**: Ensure Supabase redirect URIs are configured correctly
- **Invalid Credentials**: Check `.env` file matches Supabase project settings
- **CORS Errors**: Supabase handles CORS automatically
- **Session Lost**: Clear browser storage and retry login

### Database Issues
- Check Supabase project Dashboard for service status
- Verify database tables exist and have correct schemas
- Check authentication token permissions in Supabase

### Development Issues
- Clear `node_modules/` and reinstall: `rm -rf node_modules && npm install`
- Clear `.vite/` cache: `rm -rf .vite`
- Restart dev server: `npm run dev`

## 🌍 Environment-Specific Configuration

### Local Development
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Staging/Production
Update `.env` with production Supabase credentials and ensure:
- OAuth redirect URIs include production domain
- Domain is HTTPS
- All OAuth providers configured in Supabase

## 📚 Documentation

- [OAuth Setup Guide](./OAUTH_SETUP.md) - Complete OAuth configuration
- [Migration Guide](./MIGRATION.md) - Detailed explanation of all changes from Lovable
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

The project is ready for team contributions. Ensure:
- Follow TypeScript strict mode
- Write tests for new features
- Keep components small and focused
- Use React hooks best practices
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check [OAUTH_SETUP.md](./OAUTH_SETUP.md) troubleshooting section
2. Review [MIGRATION.md](./MIGRATION.md) for implementation details
3. Review Supabase logs in the project dashboard
4. Check browser console for errors
5. Verify environment variables are set correctly

---

**Last Updated**: February 2026  
**Version**: 1.0.0 (Post-Lovable Refactor)  
**Status**: Production Ready
