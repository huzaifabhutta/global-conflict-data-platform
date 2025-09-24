# Setup Guide

Follow these steps to get the Global Conflict Data Platform running locally.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js 18+](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/)

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd global-conflict-data-platform
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Wait for services to be ready** (about 2-3 minutes)
   - PostgreSQL will start first
   - Backend will initialize and run migrations
   - Frontend will become available last

4. **Seed the database** (in a new terminal)
   ```bash
   docker exec conflict-backend npm run prisma:migrate
   docker exec conflict-backend npm run seed
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Docs**: http://localhost:3001/api/docs

## Demo Login Credentials

- **Admin Account**
  - Email: `admin@acled.com`
  - Password: `admin123`

- **User Account**
  - Email: `user@acled.com`
  - Password: `user123`

## Local Development Setup

If you prefer to run services locally without Docker:

### 1. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/conflict_data?schema=public"
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

Run PostgreSQL (via Docker):
```bash
docker run --name postgres-conflict -e POSTGRES_PASSWORD=password -e POSTGRES_USER=admin -e POSTGRES_DB=conflict_data -p 5432:5432 -d postgres:15-alpine
```

Initialize database:
```bash
npx prisma migrate dev
npm run seed
```

Start backend:
```bash
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start frontend:
```bash
npm run dev
```

## Verification Steps

1. **Check all services are running**
   ```bash
   docker-compose ps
   ```

2. **Test API health**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Test frontend**
   - Visit http://localhost:3000
   - You should see the login page

4. **Test authentication**
   - Login with demo credentials
   - Should redirect to dashboard

## Troubleshooting

### Port Conflicts
If you get port conflicts:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Stop conflicting processes or change ports in docker-compose.yml
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Build Issues
```bash
# Clean Docker cache
docker system prune -a
docker-compose build --no-cache
```

### Permission Issues (Linux/Mac)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Development Workflow

1. **Backend changes**:
   - Edit files in `backend/src/`
   - Server auto-restarts with nodemon

2. **Frontend changes**:
   - Edit files in `frontend/src/`
   - Pages auto-reload with Next.js

3. **Database changes**:
   ```bash
   # In backend directory
   npx prisma db push    # Quick schema changes
   npx prisma migrate dev --name your-change  # Create migration
   ```

4. **View database data**:
   ```bash
   # In backend directory
   npx prisma studio
   ```

## Production Deployment

For production deployment, see the main README.md file for detailed instructions including environment variable configuration and cloud deployment options.

## Getting Help

- Check the main README.md for comprehensive documentation
- Review API documentation at http://localhost:3001/api/docs
- Open an issue in the repository for bugs or questions