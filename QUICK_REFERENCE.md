# AI CV Studio - Quick Reference

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd c:\aravindh\my-ai-cv-studio-main
pip install -r requirements.txt
npm install
```

### 2. Setup Database
```bash
python manage.py migrate
```

### 3. Start Both Servers

**Terminal 1 - Django Backend:**
```bash
python manage.py runserver
```

**Terminal 2 - React Frontend:**
```bash
npm run dev
```

**Open Browser:**
```
http://localhost:8080
```

## File Locations

| Feature | File Location |
|---------|--------------|
| Django Settings | `backend/settings.py` |
| API Endpoints | `resumes/views.py` |
| Database Model | `resumes/models.py` |
| Main App Page | `src/routes/index.tsx` |
| Resume Form | `src/components/resume/ResumeForm.tsx` |
| Resume Templates | `src/components/resume/Template1-5.tsx` |
| UI Components | `src/components/ui/` |
| Global Styles | `src/styles.css` |

## Essential Commands

### Backend Commands
```bash
# Start server
python manage.py runserver

# Create database migrations
python manage.py makemigrations

# Apply database migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Access admin panel
# http://127.0.0.1:8000/admin/
```

### Frontend Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## API Endpoints

```
GET    /api/resumes/           - List all resumes
POST   /api/resumes/           - Create new resume
GET    /api/resumes/{id}/      - Get resume by ID
PUT    /api/resumes/{id}/      - Update resume
PATCH  /api/resumes/{id}/      - Partial update
DELETE /api/resumes/{id}/      - Delete resume
```

## Testing API with curl

```bash
# List all resumes
curl http://localhost:8000/api/resumes/

# Create resume
curl -X POST http://localhost:8000/api/resumes/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "skills": "JavaScript, React",
    "experience": "5 years",
    "education": "BS Computer Science",
    "summary": "Experienced developer",
    "template": "template1"
  }'

# Get specific resume
curl http://localhost:8000/api/resumes/1/

# Update resume
curl -X PUT http://localhost:8000/api/resumes/1/ \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete resume
curl -X DELETE http://localhost:8000/api/resumes/1/
```

## Project URLs

| Service | URL |
|---------|-----|
| React App | http://localhost:8080 |
| Django Server | http://127.0.0.1:8000 |
| API Root | http://127.0.0.1:8000/api/ |
| Admin Panel | http://127.0.0.1:8000/admin/ |
| Browsable API | http://127.0.0.1:8000/api/resumes/ |

## Environment Setup

### Create .env file
```env
# Backend Configuration
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend API
VITE_API_URL=http://localhost:8000/api

# Supabase (if using AI features)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

## Virtual Environment

### Create
```bash
python -m venv .venv
```

### Activate (Windows)
```bash
.venv\Scripts\activate
```

### Deactivate
```bash
deactivate
```

### Check if Active
Look for `(.venv)` in your terminal prompt

## Troubleshooting

### Issue: "Port already in use"
```bash
# Find process
netstat -ano | findstr :8000

# Kill process (replace 12345 with PID)
taskkill /PID 12345 /F
```

### Issue: "ModuleNotFoundError"
```bash
# Ensure virtual environment is activated
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Issue: "No module named django"
```bash
# Activate venv
.venv\Scripts\activate

# Install django
pip install django
```

### Issue: Database errors
```bash
# Delete and recreate database
del db.sqlite3
python manage.py migrate
```

## File Structure Quick View

```
my-ai-cv-studio-main/
├── backend/              → Django configuration
├── resumes/              → Django app
├── src/                  → React code
├── manage.py             → Django management
├── package.json          → Frontend dependencies
├── requirements.txt      → Backend dependencies
├── README.md             → Full documentation
├── SETUP.md              → Setup guide
└── PROJECT_STRUCTURE.md  → Detailed structure
```

## React Component Hierarchy

```
<Index>
  ├── <AiBuilder>
  ├── <SavedResumes>
  ├── <ResumeForm>
  └── <ResumePreview>
       └── <Template1-5>
```

## Resume Data Structure

```typescript
{
  id: string;
  name: string;
  email: string;
  skills: string;
  experience: string;
  education: string;
  summary: string;
  template: "template1" | "template2" | ... | "template5";
  created_at: string;
}
```

## Dependencies

### Backend (Python)
- Django 5.2.13
- Django REST Framework 3.14.0
- Django CORS Headers 4.3.1

### Frontend (Node)
- React 18.3.1
- Vite 6.0.3
- TanStack Router 1.168.0
- TypeScript 5.7.2
- Tailwind CSS 4.2.1

## Common Tasks

### Add a new field to Resume
1. Edit `resumes/models.py`
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`
4. Update `ResumeForm.tsx` in React

### Add a new API endpoint
1. Add method to `ResumeViewSet` in `resumes/views.py`
2. DRF router automatically creates URL
3. Update React to call new endpoint

### Customize styling
1. Edit `src/styles.css` for global styles
2. Edit template CSS files (e.g., `Template1.css`)
3. Tailwind classes available in all React components

### Deploy to production
1. Build frontend: `npm run build`
2. Serve with web server (Nginx, Apache)
3. Run Django with production server (Gunicorn)
4. See `README.md` for detailed instructions

## Support Files

- `README.md` - Full documentation
- `SETUP.md` - Windows setup guide
- `PROJECT_STRUCTURE.md` - Detailed structure
- `QUICK_REFERENCE.md` - This file
- `.env.example` - Environment template
- `requirements.txt` - Python dependencies

## Next Steps

1. ✅ Project setup complete
2. ✅ Both servers running
3. 📝 Create your first resume
4. 🎨 Customize templates
5. 🚀 Deploy to production

## Getting Help

Check in this order:
1. Terminal error messages
2. Browser console (F12)
3. `SETUP.md` for setup issues
4. `README.md` for documentation
5. `PROJECT_STRUCTURE.md` for code organization
