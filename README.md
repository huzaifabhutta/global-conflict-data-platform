# Global Conflict Data Platform

A full-stack web application for analyzing and visualizing global conflict data, built for ACLED portfolio demonstration.

## Overview

This platform demonstrates comprehensive full-stack development skills including RESTful API development, data visualization, authentication, security best practices, and containerized deployment.

### Key Features

- 🔐 **JWT Authentication** with role-based access control
- 📊 **Interactive Data Visualization** with Chart.js
- 🗺️ **Geographic Mapping** with Leaflet integration
- 📈 **Real-time Statistics** and analytics
- 🔍 **Advanced Filtering** and search capabilities
- 📤 **Data Export** (JSON/CSV formats)
- 🐳 **Docker Containerization** for easy deployment
- 📝 **API Documentation** with Swagger/OpenAPI
- 🔒 **Security Best Practices** implemented throughout

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server runtime and web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **Prisma** - Modern database ORM
- **JWT** - Authentication tokens
- **Joi** - Input validation
- **Winston** - Logging
- **Swagger** - API documentation

### Frontend
- **React** + **Next.js 14** - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Chart.js** + **React-Chartjs-2** - Data visualization
- **Leaflet** + **React-Leaflet** - Interactive maps
- **React Query** - Server state management
- **React Hook Form** - Form handling

### DevOps
- **Docker** + **Docker Compose** - Containerization
- **PostgreSQL** - Database container
- **Multi-stage builds** - Optimized images

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- npm or yarn package manager

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone global-conflict-data-platform
   cd global-conflict-data-platform
   ```

2. **Start the application**
   ```bash
   docker-compose up --build 
   ```

3. **Initialize the database** (in a new terminal)
   ```bash
   docker exec conflict-backend npm run prisma:migrate
   docker exec conflict-backend npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

### Option 2: Run via script

   ```bash
      ./start.sh #sudo ./start.sh
   ```
## Demo Accounts

The application comes with pre-configured demo accounts:

- **Admin User**
  - Email: `admin@acled.com`
  - Password: `admin123`
  - Access: Full platform access including user management

- **Regular User**
  - Email: `user@acled.com`
  - Password: `user123`
  - Access: Standard data viewing and analysis features

## API Documentation

### Interactive Documentation
Visit http://localhost:3001/api/docs for comprehensive interactive API documentation.

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Conflicts
- `GET /api/conflicts` - List conflicts with filtering and pagination
- `GET /api/conflicts/:id` - Get specific conflict details
- `GET /api/conflicts/stats` - Get conflict statistics
- `GET /api/conflicts/export` - Export data (JSON/CSV)

#### Regions
- `GET /api/regions` - List regions with conflict counts
- `GET /api/regions/:region/conflicts` - Get conflicts by region

#### Users (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt-token>
```

## Application Structure

```
/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication, validation, error handling
│   │   ├── utils/          # JWT, Prisma, logging utilities
│   │   └── index.ts        # Application entry point
│   ├── prisma/             # Database schema and migrations
│   └── Dockerfile          # Backend container configuration
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── pages/          # Application pages/routes
│   │   ├── components/     # Reusable React components
│   │   ├── utils/          # API client, auth utilities
│   │   └── styles/         # Global styles and Tailwind
│   └── Dockerfile          # Frontend container configuration
└── docker-compose.yml      # Multi-service orchestration
```

## Development Commands

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run prisma:migrate    # Run database migrations
npm run prisma:generate   # Generate Prisma client
npm run seed         # Populate database with sample data
npm run lint         # Run ESLint
```

### Frontend
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linting
npm run type-check   # TypeScript type checking
```

### Docker
```bash
docker-compose up --build     # Build and start all services
docker-compose down           # Stop and remove containers
docker-compose logs backend   # View backend logs
docker-compose exec backend sh  # Access backend container shell
```

## Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `password` - Hashed password
- `role` - USER or ADMIN
- `createdAt` - Account creation timestamp

### Conflicts Table
- `id` - Unique identifier (CUID)
- `title` - Conflict description
- `country` - Country where conflict occurred
- `region` - Geographic region
- `latitude/longitude` - Precise coordinates
- `date` - Conflict date
- `fatalities` - Number of casualties
- `eventType` - Type of conflict event
- `source` - Data source (default: ACLED)

## Deployment

### Production Deployment

1. **Environment Variables**
   ```bash
   # Backend
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secure-secret-key
   NODE_ENV=production

   # Frontend
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

2. **Docker Production**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Cloud Deployment Options

- **Backend**: Railway, Render, AWS ECS, Google Cloud Run
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, Google Cloud SQL, Railway PostgreSQL

## Security Considerations

- Environment variables are properly secured
- JWT tokens have appropriate expiration times
- Database credentials are not exposed
- Input validation prevents injection attacks
- Rate limiting protects against abuse
- HTTPS should be used in production
- Database connections use SSL in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Backend Testing
```bash
cd backend
npm test                    # Run test suite
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                    # Run Jest test suite
npm run test:e2e          # Run end-to-end tests
```

## Performance Monitoring

- **Backend**: Winston logging with log levels
- **Frontend**: Built-in Next.js analytics
- **Database**: Prisma query logging
- **Docker**: Container resource monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check connection string in .env
   - Verify database exists

2. **Docker Build Issues**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

3. **Frontend API Connection**
   - Verify NEXT_PUBLIC_API_URL environment variable
   - Check CORS configuration in backend
   - Ensure backend is running and accessible

4. **Authentication Issues**
   - Clear browser local storage and cookies
   - Verify JWT secret matches between environments
   - Check token expiration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ACLED for conflict data methodology inspiration
- Open source community for excellent tooling
- Chart.js and Leaflet for visualization libraries

---

**Built with ❤️ for ACLED Portfolio Demonstration**

For questions or support, please open an issue in the repository.