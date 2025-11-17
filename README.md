# Software Quality Books

A web application for managing and reviewing software quality books.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20.x recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd software-quality-books
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
    - Copy `.env.development` to `.env`:
   ```bash
   cp .env.development .env
   ```
    - Update the following variables in `.env`:
        - `DATABASE_URL`: SQLite database file path (default: `file:./dev.db`)
        - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
        - `NEXTAUTH_URL`: `http://localhost:3000` for local development

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Seed the database with test data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Test Users

After seeding the database, you can log in with these test accounts:

- Email: `test@test.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`

### Database Issues

If you encounter database-related errors:

```bash
# Reset the database and apply all migrations
npx prisma migrate reset
npm run seed
```

You can also run Prisma Studio to view the database:

```bash
npx prisma studio
```

User authentication with Auth.js v5

## Test Users

After seeding the database, you can log in with these test accounts:

- Email: `test@test.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`

## Running Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

## Project Structure

```
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # Reusable React components
│   ├── lib/            # Utility functions and configurations
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── prisma/             # Database schema and migrations
├── tests/              # End-to-end tests
│   ├── fixtures/       # Test fixtures
│   ├── helpers/        # Test helper functions
│   └── page-objects/   # Page object models
└── public/             # Static files
```

## Key Features

- User authentication with NextAuth.js
- Book management (Create, Read, Update, Delete)
- Book reviews and ratings
- User profiles
- End-to-end testing with Playwright

## Technology Stack

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)

### Database Issues

If you encounter database-related errors:

```bash
# Reset the database
npx prisma db push --force-reset
npm run seed
```

You can also run the Prisma Studio to view the database:

```bash
npx prisma studio
```

## VS Code Extensions

You may want to install the following extensions

- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) - Adds syntax highlighting and formatting
  for Prisma schema files
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - Provides
  autocomplete and syntax highlighting for Tailwind CSS classes
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - JavaScript/TypeScript linting
- [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) - Run and
  debug Playwright tests

## Live Instance

[Vercal Hosted Instance](https://software-quality-books.vercel.app/)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## License

This project is part of a training course and is intended for educational purposes only.  
Original repo by Richard Bradshaw available here: https://github.com/FriendlyTester/software-quality-books
