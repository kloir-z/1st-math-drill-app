# Suggested Commands

## Development Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## System Commands (Linux)
- `ls` - List directory contents
- `cd <path>` - Change directory
- `grep <pattern> <files>` - Search for patterns in files
- `find <path> -name <pattern>` - Find files by name pattern
- `git status` - Check git repository status
- `git add <files>` - Stage files for commit
- `git commit -m "<message>"` - Commit staged changes
- `git push` - Push commits to remote repository

## Task Completion Workflow
1. After making code changes, run `npm run lint` to check for linting issues
2. Run `npm run build` to ensure TypeScript compilation succeeds
3. Test the application with `npm run dev` if needed
4. No dedicated test command is available - manual testing required

## Notes
- No dedicated test runner is configured
- No formatting command (like Prettier) is set up
- TypeScript strict mode is enabled with additional strict options