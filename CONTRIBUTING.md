# Contributing to LeniLani Tourism & Hospitality AI Chatbot

First off, thank you for considering contributing to our project! 🌺

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**

1. **Clear title and description**
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment details:**
   - OS and version
   - Node.js version
   - Browser and version
   - Database type

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**

1. **Use case** - Explain why this enhancement would be useful
2. **Possible implementation** - If you have ideas on how to implement it
3. **Alternatives** - Any alternative solutions you've considered

### Pull Requests

1. **Fork the repository**

2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/tourism-hospitality-chatbot.git
   cd tourism-hospitality-chatbot
   ```

3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

7. **Test your changes:**
   ```bash
   npm run dev
   # Test the application thoroughly
   ```

8. **Lint your code:**
   ```bash
   npm run lint
   ```

9. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Follow conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks

10. **Push to your fork:**
    ```bash
    git push origin feature/your-feature-name
    ```

11. **Create a Pull Request:**
    - Go to the original repository
    - Click "New Pull Request"
    - Select your fork and branch
    - Fill in the PR template
    - Submit for review

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Development

1. **Database setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - API: http://localhost:3000/api

### Project Structure

```
app/           # Next.js app directory
components/    # React components
lib/           # Utility functions
prisma/        # Database schema
public/        # Static assets
```

### Key Technologies

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma ORM
- **Authentication:** JWT
- **API:** Next.js API Routes

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for component props
- Avoid `any` type when possible

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts`
- Styles: `kebab-case.css`

### Example Component:

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ 
  label, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
```

## Testing

While we don't have comprehensive tests yet, we encourage:

- Manual testing of all changes
- Testing across different browsers
- Mobile responsiveness testing
- API endpoint testing with tools like Postman

## Documentation

When adding new features:

1. Update README.md if needed
2. Add JSDoc comments for functions
3. Update API documentation for new endpoints
4. Include inline comments for complex logic

## Questions?

Feel free to:

- Open an issue for questions
- Join our discussions
- Email us at contribute@lenilani.com

## Recognition

Contributors will be:

- Listed in our README
- Mentioned in release notes
- Given credit in commit messages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Mahalo for contributing! 🌴