# AI CV Studio - Setup Guide (Windows)

## Quick Start

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Git (optional)

### Step 1: Clone/Navigate to Project

```bash
cd c:\aravindh\my-ai-cv-studio-main
```

### Step 2: Setup Backend (Django)

#### Create Virtual Environment
```bash
python -m venv .venv
.venv\Scripts\activate
```

You should see `(.venv)` in your terminal prompt.

#### Install Dependencies
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install django==5.2.13 djangorestframework==3.14.0 django-cors-headers==4.3.1
```

#### Setup Database
```bash
python manage.py migrate
```

#### Create Admin User (Optional)
```bash
python manage.py createsuperuser
```

### Step 3: Setup Frontend (React)

#### Install Node Dependencies
```bash
npm install
```

### Step 4: Run the Application

#### Terminal 1 - Start Django Backend
```bash
# Make sure you're in the project root with virtual environment activated
(.venv) C:\aravindh\my-ai-cv-studio-main> python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

#### Terminal 2 - Start React Frontend
```bash
# Open a new PowerShell/Command Prompt window
# Navigate to project root
cd c:\aravindh\my-ai-cv-studio-main

# Start the dev server
npm run dev
```

You should see:
```
  VITE v7.3.2  ready in XXX ms
  ➜  Local:   http://localhost:8080/
```

### Step 5: Access the Application

1. Open your browser
2. Go to `http://localhost:8080`
3. Start creating resumes!

## Troubleshooting

### Port Already in Use

#### Find process on port 8000 (Django)
```bash
netstat -ano | findstr :8000
```

#### Find process on port 8080 (Vite)
```bash
netstat -ano | findstr :8080
```

#### Kill the process (replace PID with the number from above)
```bash
taskkill /PID 12345 /F
```

### Virtual Environment Issues

#### If virtual environment won't activate
```bash
# Remove existing venv
rmdir /s /q .venv

# Create new one
python -m venv .venv

# Activate
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### ModuleNotFoundError

Make sure virtual environment is activated:
```bash
# Check if (.venv) appears in your prompt
# If not, activate it:
.venv\Scripts\activate
```

### npm install fails

```bash
# Clear cache
npm cache clean --force

# Remove node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Database Issues

```bash
# Reset database completely
del db.sqlite3

# Recreate
python manage.py migrate

# Create new admin user
python manage.py createsuperuser
```

## Project Structure

```
c:\aravindh\my-ai-cv-studio-main\
├── .venv/                 # Virtual environment
├── backend/               # Django settings
├── resumes/               # Django app
├── src/                   # React frontend code
├── manage.py              # Django management
├── package.json           # Node dependencies
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── vite.config.ts         # Vite configuration
└── README.md              # Documentation
```

## Common Commands

### Backend
```bash
# Start server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access Django shell
python manage.py shell

# Create superuser
python manage.py createsuperuser

# Access admin panel
# http://127.0.0.1:8000/admin/
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## API Testing

Once servers are running, test the API:

```bash
# Get all resumes
curl http://localhost:8000/api/resumes/

# Or open in browser:
http://localhost:8000/api/resumes/
```

## Next Steps

1. ✅ Setup complete!
2. Create your first resume via the React frontend
3. Customize templates in `src/components/resume/`
4. Add more features to the Django backend
5. Deploy to production when ready

## Help & Support

- Check logs in terminal for errors
- Verify both servers are running
- Ensure ports 8000 and 8080 are available
- Check `.env` file for correct configuration

## Environment Variables

Create `.env` file in project root:

```env
# Backend
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True

# Frontend API
VITE_API_URL=http://localhost:8000/api

# Supabase (if using AI features)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

Refer to `.env.example` for all available options.
