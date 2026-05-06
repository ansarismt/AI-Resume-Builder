# AI CV Studio

A full-stack resume builder application with AI assistance. Built with React (frontend) and Django (backend).

## Project Structure

```
my-ai-cv-studio/
├── backend/                    # Django REST API
│   ├── settings.py            # Django settings
│   ├── urls.py                # Django URL configuration
│   ├── wsgi.py                # WSGI application
│   └── asgi.py                # ASGI application
├── resumes/                    # Django app for resume management
│   ├── models.py              # Resume database model
│   ├── views.py               # API viewsets
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # App URL routing
│   └── migrations/            # Database migrations
├── src/                        # React frontend (Vite)
│   ├── components/
│   │   ├── resume/            # Resume-related components
│   │   └── ui/                # Reusable UI components
│   ├── routes/                # TanStack Router pages
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # External API integrations
│   ├── lib/                   # Utility functions
│   ├── styles.css             # Global styles
│   └── router.tsx             # Router configuration
├── manage.py                  # Django management script
├── package.json               # Frontend dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── .env                       # Environment variables
```

## Features

- ✨ AI-powered resume builder with Supabase Edge Functions
- 📝 Multiple professional resume templates
- 💾 Save and manage multiple resumes
- 🎨 Real-time preview with 5 different templates
- 🔐 Secure backend with Django REST Framework
- 🚀 Full-stack TypeScript application

## Prerequisites

- Python 3.11+
- Node.js 18+ / npm
- Virtual environment (venv or similar)

## Installation & Setup

### 1. Backend Setup (Django)

```bash
# Navigate to project root
cd c:\aravindh\my-ai-cv-studio-main

# Create and activate virtual environment (if not already done)
python -m venv .venv
.venv\Scripts\activate

# Install Python dependencies
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser
```

### 2. Frontend Setup (React)

```bash
# Install Node dependencies
npm install
```

### 3. Environment Configuration

Create `.env` file in project root:

```env
# Backend
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend (for API calls)
VITE_API_URL=http://localhost:8000/api
```

## Running the Application

### Start Backend (Django)

```bash
# Terminal 1: Start Django development server
python manage.py runserver

# Server runs at http://127.0.0.1:8000
# API available at http://127.0.0.1:8000/api/resumes/
# Admin panel at http://127.0.0.1:8000/admin/
```

### Start Frontend (React)

```bash
# Terminal 2: Start React development server
npm run dev

# Server runs at http://localhost:8080
# Open http://localhost:8080 in your browser
```

## API Endpoints

### Resumes
- `GET /api/resumes/` - List all resumes
- `POST /api/resumes/` - Create a new resume
- `GET /api/resumes/{id}/` - Get specific resume
- `PUT /api/resumes/{id}/` - Update resume
- `PATCH /api/resumes/{id}/` - Partial update
- `DELETE /api/resumes/{id}/` - Delete resume

### Example API Usage

```bash
# Create a resume
curl -X POST http://localhost:8000/api/resumes/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "skills": "JavaScript, React, Python",
    "experience": "5 years as a software engineer",
    "education": "BS in Computer Science",
    "summary": "Experienced developer",
    "template": "template1"
  }'

# Get all resumes
curl http://localhost:8000/api/resumes/
```

## Database

The project uses SQLite (default Django database) for development. Database file: `db.sqlite3`

### Resume Model Fields
- `id` - Auto-generated primary key
- `name` - Full name (max 100 chars)
- `email` - Email address
- `skills` - Skills description (text)
- `experience` - Work experience (text)
- `education` - Education details (text)
- `summary` - Professional summary (text)
- `template` - Selected template (default: template1)
- `created_at` - Creation timestamp (auto)

## Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

### Backend
```bash
python manage.py runserver           # Start development server
python manage.py migrate            # Run database migrations
python manage.py makemigrations     # Create migration files
python manage.py createsuperuser    # Create admin user
python manage.py shell              # Django shell
```

## Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TanStack Router** - Client-side routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API framework
- **Django CORS Headers** - CORS support
- **SQLite** - Database (development)
- **Python 3.11** - Programming language

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:8080`
- `http://127.0.0.1:8080`
- All origins in development mode (can be restricted for production)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000 (Django)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 8080 (React)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database Issues
```bash
# Reset database (delete and recreate)
del db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Virtual Environment Issues
```bash
# Deactivate current environment
deactivate

# Remove and recreate
rmdir /s .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Development Workflow

1. **Make changes to backend** → Django auto-reloads
2. **Make changes to frontend** → Vite auto-reloads
3. **Test API** → Use the DRF browsable API at `/api/resumes/` or Postman
4. **Test frontend** → Open http://localhost:8080

## Production Deployment

### Backend (Django)
```bash
# Update settings.py for production
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = 'production-secret-key'

# Use production server (Gunicorn, uWSGI, etc.)
pip install gunicorn
gunicorn backend.wsgi:application
```

### Frontend (React)
```bash
# Build for production
npm run build

# Output in dist/ folder - deploy to static hosting
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on the project repository.
