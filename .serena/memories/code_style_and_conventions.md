# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with additional strict options
- **Target**: ES2020
- **Module System**: ESNext with bundler resolution
- **JSX**: react-jsx (no need to import React)
- **Additional Strict Options**:
  - `noUnusedLocals: true`
  - `noUnusedParameters: true` 
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedSideEffectImports: true`

## ESLint Configuration
- Uses TypeScript ESLint with recommended rules
- React Hooks plugin with recommended rules
- React Refresh plugin for development
- Targets `**/*.{ts,tsx}` files
- Ignores `dist` directory

## Naming Conventions
- **Components**: PascalCase (e.g., `MathProblem`, `NumberPad`)
- **Files**: PascalCase for components, camelCase for utilities
- **Enums**: PascalCase with descriptive names (e.g., `ProblemType`)
- **Interfaces**: PascalCase with descriptive names (e.g., `MathProblemProps`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `userInput`)

## File Organization
- `src/components/` - React components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks  
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/data/` - Static data and problem definitions

## React Patterns
- Functional components with hooks
- Context providers for global state
- Custom hooks for reusable logic
- Props interfaces defined for all components
- Event handlers prefixed with `handle` (e.g., `handleBack`, `handleSubmit`)

## CSS/Styling
- Tailwind CSS for all styling
- Utility-first approach
- Responsive design with breakpoint prefixes (`md:`, `lg:`, etc.)
- Custom CSS minimal, mostly in `src/index.css`

## Japanese Language Support
- UI text and labels in Japanese
- Problem type labels use descriptive Japanese terms
- Comments may be in Japanese when describing problem types