# Project Structure

## Directory Overview

```
my-ai-cv-studio-main/
│
├── 📁 backend/                 # Django Project Configuration
│   ├── __init__.py
│   ├── settings.py            # Django settings & configuration
│   ├── urls.py                # Main URL router
│   ├── wsgi.py                # WSGI application entry point
│   ├── asgi.py                # ASGI application entry point
│   └── __pycache__/           # Python cache files
│
├── 📁 resumes/                 # Django App - Resume Management
│   ├── migrations/            # Database migration files
│   │   ├── 0001_initial.py
│   │   └── __init__.py
│   ├── __init__.py
│   ├── admin.py               # Django admin configuration
│   ├── apps.py                # App configuration
│   ├── models.py              # Resume database model
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API viewsets
│   ├── urls.py                # App URL routing
│   ├── tests.py               # Tests (if any)
│   └── __pycache__/           # Python cache files
│
├── 📁 src/                     # React Frontend (Vite)
│   ├── components/            # Reusable React components
│   │   ├── resume/            # Resume-related components
│   │   │   ├── AiBuilder.tsx         # AI prompt input
│   │   │   ├── ResumeForm.tsx        # Resume form
│   │   │   ├── ResumePreview.tsx     # Preview component
│   │   │   ├── SavedResumes.tsx      # List saved resumes
│   │   │   ├── TemplateSelector.tsx  # Template picker
│   │   │   ├── Template1.tsx         # Template 1
│   │   │   ├── Template1.css
│   │   │   ├── Template2.tsx         # Template 2
│   │   │   ├── Template2.css
│   │   │   ├── Template3.tsx         # Template 3
│   │   │   ├── Template3.css
│   │   │   ├── Template4.tsx         # Template 4
│   │   │   ├── Template4.css
│   │   │   ├── Template5.tsx         # Template 5
│   │   │   ├── Template5.css
│   │   │   └── types.ts              # TypeScript interfaces
│   │   │
│   │   └── ui/                # Reusable UI Components (shadcn/ui)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── sonner.tsx          # Toast notification
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   └── use-mobile.tsx     # Mobile detection hook
│   │
│   ├── integrations/          # External Service Integrations
│   │   └── supabase/          # Supabase configuration
│   │       ├── client.ts      # Supabase client
│   │       ├── client.server.ts
│   │       ├── auth-middleware.ts
│   │       └── types.ts
│   │
│   ├── lib/                   # Utility Functions
│   │   └── utils.ts           # Common utilities
│   │
│   ├── routes/                # TanStack Router Pages
│   │   ├── __root.tsx         # Root layout
│   │   └── index.tsx          # Home page
│   │
│   ├── router.tsx             # Router configuration
│   ├── routeTree.gen.ts       # Auto-generated route tree
│   ├── styles.css             # Global styles
│   ├── main.tsx               # React entry point
│   └── vite-env.d.ts          # Vite TypeScript definitions
│
├── 📁 .venv/                  # Python Virtual Environment
│
├── 📁 .tanstack/              # TanStack configuration
│
├── 📁 node_modules/           # Node packages
│
├── 📁 supabase/               # Supabase Edge Functions (Optional)
│   ├── config.toml
│   └── functions/
│       ├── build-resume/      # AI resume builder function
│       └── generate-summary/  # AI summary generator
│
├── 📄 manage.py               # Django management script
├── 📄 package.json            # Frontend dependencies
├── 📄 package-lock.json       # Dependency lock file
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 vite.config.ts          # Vite build configuration
├── 📄 eslint.config.js        # ESLint configuration
├── 📄 .prettierrc              # Prettier configuration
├── 📄 .prettierignore         # Prettier ignore rules
├── 📄 .gitignore              # Git ignore rules
├── 📄 components.json         # UI components config
├── 📄 bunfig.toml             # Bun configuration (optional)
├── 📄 wrangler.jsonc          # Cloudflare Workers config
│
├── 📄 .env                    # Environment variables (local)
├── 📄 .env.example            # Environment template
├── 📄 db.sqlite3              # SQLite database
│
├── 📄 README.md               # Main documentation
├── 📄 SETUP.md                # Windows setup guide
├── 📄 PROJECT_STRUCTURE.md    # This file
├── 📄 requirements.txt        # Python dependencies
│
└── 📄 start-dev.bat           # Windows development startup script
```

## Key Files Explained

### Backend (Django)

| File | Purpose |
|------|---------|
| `manage.py` | Django management script for commands |
| `backend/settings.py` | Django configuration (DB, apps, middleware, etc.) |
| `backend/urls.py` | Main URL router, includes app URLs |
| `resumes/models.py` | Resume database model definition |
| `resumes/serializers.py` | DRF serializers for Resume model |
| `resumes/views.py` | API viewsets for CRUD operations |
| `resumes/urls.py` | Resume app URL routing |
| `resumes/admin.py` | Django admin configuration |
| `db.sqlite3` | SQLite database (created after migration) |

### Frontend (React)

| File | Purpose |
|------|---------|
| `src/router.tsx` | TanStack Router configuration |
| `src/routes/__root.tsx` | Root layout wrapper |
| `src/routes/index.tsx` | Home page / main application |
| `src/components/resume/types.ts` | TypeScript interfaces for resume data |
| `src/components/resume/ResumeForm.tsx` | Form for creating/editing resumes |
| `src/components/resume/SavedResumes.tsx` | List of saved resumes |
| `src/components/resume/ResumePreview.tsx` | Live preview of resume |
| `src/components/resume/AiBuilder.tsx` | AI-powered resume builder |
| `src/styles.css` | Global Tailwind CSS styles |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies and scripts |
| `requirements.txt` | Backend dependencies |
| `.env` | Environment variables (local, not in git) |
| `.env.example` | Template for environment variables |
| `.gitignore` | Git ignore rules |
| `eslint.config.js` | ESLint rules |
| `.prettierrc` | Code formatting rules |

## Data Flow

```
┌─────────────┐
│   React UI  │
│  (Browser)  │
└──────┬──────┘
       │ fetch/axios
       ↓
┌─────────────────────┐
│  Vite Dev Server    │
│  http://8080        │
└──────┬──────────────┘
       │ API calls
       ↓
┌─────────────────────┐
│  Django REST API    │
│  http://8000/api    │
└──────┬──────────────┘
       │ SQL queries
       ↓
┌─────────────────────┐
│  SQLite Database    │
│  db.sqlite3         │
└─────────────────────┘
```

## File Organization Best Practices

### Where to Add New Files

- **New Components**: `src/components/resume/` or `src/components/ui/`
- **New Hooks**: `src/hooks/`
- **Utilities**: `src/lib/`
- **New Routes**: `src/routes/` (one file per route)
- **Django App Features**: `resumes/` or create new app
- **Styles**: Global in `src/styles.css` or co-located with component

### Naming Conventions

- **React Components**: PascalCase (e.g., `MyComponent.tsx`)
- **Utility Functions**: camelCase (e.g., `formatDate.ts`)
- **Interfaces/Types**: PascalCase (e.g., `ResumeData`)
- **Django Models**: PascalCase (e.g., `Resume`)
- **Django Functions**: snake_case (e.g., `get_resume`)
- **CSS Files**: kebab-case (e.g., `template-1.css`)

## Database Schema

### Resume Model
```
Resume
├── id (AutoField) - Primary Key
├── name (CharField, max_length=100)
├── email (EmailField)
├── skills (TextField)
├── experience (TextField)
├── education (TextField)
├── summary (TextField)
├── template (CharField, choices=[template1-5])
└── created_at (DateTimeField, auto_now_add=True)
```

## API Endpoints

```
/api/
├── resumes/
│   ├── GET              → List all resumes
│   ├── POST             → Create resume
│   ├── {id}/
│   │   ├── GET          → Retrieve resume
│   │   ├── PUT          → Update resume
│   │   ├── PATCH        → Partial update
│   │   └── DELETE       → Delete resume
│   └── {id}.json        → JSON detail view
```

## Environment Variables

```env
# Backend
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=True/False
DJANGO_ALLOWED_HOSTS=...

# Frontend
VITE_API_URL=http://localhost:8000/api

# Supabase (Optional)
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Development Workflow

1. **Make backend changes** → Django auto-reloads (check terminal)
2. **Make frontend changes** → Vite auto-reloads (check browser)
3. **Database changes** → Create migration: `python manage.py makemigrations`
4. **Apply migration** → `python manage.py migrate`
5. **Test API** → Use browsable API at `/api/resumes/`

## Common Modifications

### Add New Field to Resume
1. Edit `resumes/models.py` - Add field to Resume model
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`
4. Update `ResumeForm.tsx` to include new field
5. Update `ResumePreview.tsx` to display new field

### Add New Template
1. Create `TemplateX.tsx` in `src/components/resume/`
2. Create `TemplateX.css` for styling
3. Add to `TEMPLATE_IDS` in `types.ts`
4. Update `Template1.tsx` model TEMPLATE_CHOICES

### Add New API Endpoint
1. Create method in `resumes/views.py` ViewSet
2. DRF auto-generates URL via router
3. Update frontend fetch calls in React components

## Production Deployment

See `README.md` for production deployment instructions including:
- Django deployment with Gunicorn
- Frontend build optimization
- Database migration strategy
- Static file serving
