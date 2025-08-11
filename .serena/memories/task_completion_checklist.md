# Task Completion Checklist

## Required Steps After Making Code Changes

### 1. Code Quality Check
- Run `npm run lint` to check for ESLint violations
- Fix any linting errors or warnings before proceeding
- Ensure code follows the established conventions

### 2. Build Verification  
- Run `npm run build` to verify TypeScript compilation
- Check that both TypeScript compiler (`tsc -b`) and Vite build succeed
- Fix any TypeScript errors that prevent compilation

### 3. Manual Testing (Recommended)
- Run `npm run dev` to start the development server
- Test the functionality you modified in the browser
- Verify the app works correctly and no runtime errors occur

### 4. Git Workflow (if applicable)
- Stage changes with `git add <files>`
- Commit with descriptive message: `git commit -m "<description>"`
- Push to remote if needed: `git push`

## Important Notes
- No automated test suite is configured - rely on manual testing
- No code formatter (Prettier) is set up - follow existing code style manually
- TypeScript strict mode will catch many issues at compile time
- The app uses React 18 with modern hooks patterns
- All components should be properly typed with TypeScript interfaces

## When Task is Complete
- Ensure `npm run lint` passes without errors
- Ensure `npm run build` completes successfully
- Confirm the application runs without runtime errors
- Verify the specific functionality requested works as expected