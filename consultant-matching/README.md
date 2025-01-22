# ConsultMatch - Consultant Matching Platform

A modern web application that connects consultants with projects using intelligent matching algorithms.

## Features

- Role-based authentication (Consultants, Project Managers, Partners)
- Intelligent project-consultant matching
- Real-time project management
- Profile management for consultants
- Project creation and management for partners
- Team coordination for project managers

## Tech Stack

- React 18 with TypeScript
- Firebase (Authentication, Firestore)
- TailwindCSS for styling
- Vite for build tooling

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account and project

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/consultant-matching.git
cd consultant-matching
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── features/       # Feature-specific components
├── pages/         # Page components
├── config/        # Configuration files
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Naming Conventions

- Components: PascalCase (e.g., `ConsultantForm.tsx`)
- Files: kebab-case (e.g., `consultant-form.ts`)
- Functions: camelCase (e.g., `handleSubmit`)
- Types/Interfaces: PascalCase with prefix I for interfaces (e.g., `IConsultant`)
- CSS Modules: [name].module.css

## Available Routes

- `/` - Home page
- `/consultant` - Consultant portal
- `/admin` - Admin portal

## Development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Best Practices

- Use TypeScript for type safety
- Implement component-based architecture
- Keep components small and focused
- Use proper prop typing
- Follow ESLint rules
- Write clean, documented code

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
