# Loan Repayment Calculator

A modern web application for calculating and visualizing loan repayment schedules with prepayment options, built with React, TypeScript, and Firebase.

## Features

- 🔐 **User Authentication** - Secure sign-up and login with Firebase Auth
- 💾 **Cloud Storage** - Save and sync loan configurations across devices
- 📊 **Interactive Calculator** - Real-time loan schedule calculations
- 💰 **Prepayment Modeling** - Visualize impact of prepayments on loan tenure
- 📈 **Split-Screen Interface** - Configuration panel and table view
- 📤 **CSV Export** - Download repayment schedules
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 19** with TypeScript
- **Firebase** (Authentication, Firestore, Hosting)
- **Vite** with rolldown for fast builds
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) package manager
- Firebase project (already configured)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

### Development

Start the development server:
```bash
bun dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the optimized production bundle:
```bash
bun run build:prod
```

Preview the production build locally:
```bash
bun run preview
```

## Deployment

The application is deployed to Firebase Hosting. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
bun run deploy
```

This will build and deploy the application to Firebase Hosting.

## Project Structure

```
loan-calc/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .kiro/               # Kiro specs and configuration
├── dist/                # Production build output
└── public/              # Static assets
```

## Available Scripts

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run build:prod` - Build with production environment
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run deploy` - Deploy to Firebase Hosting
- `bun run deploy:full` - Deploy hosting and Firestore rules

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
