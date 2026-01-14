# Contributing to Commonplace

Thank you for your interest in contributing to Commonplace!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/InquiryInstitute/directus.git
   cd directus
   ```

2. **Set up Supabase**
   - Create a Supabase project
   - Apply migrations: `./scripts/apply-migrations.sh`
   - Create storage bucket: `commonplace-assets`

3. **Set up Directus**
   ```bash
   cd docker
   cp .env.example .env
   # Edit .env with your credentials
   docker-compose up -d
   ```

4. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local
   npm run dev
   ```

## Code Style

- **SQL**: Use consistent formatting, include comments
- **TypeScript/JavaScript**: Follow ESLint rules, use TypeScript for new code
- **Commits**: Use conventional commits format

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a PR with a clear description

## Questions?

Contact the Inquiry Institute technical team.
