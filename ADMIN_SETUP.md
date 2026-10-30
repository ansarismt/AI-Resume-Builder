# Admin Setup & AI Builder Guide

## Admin Credentials Created ✅

Admin user has been successfully created for your project with environment-based configuration.

### Default Credentials
- **URL**: `http://127.0.0.1:8000/admin/`
- **Username**: `admin`
- **Email**: `admin@analytical.engine`
- **Password**: `Admin@123456`

⚠️ **IMPORTANT**: Change this password after your first login in production!

## Creating Admin User

### Option 1: Using Defaults (Quickest)
```bash
python create_admin.py
```
Creates admin with default credentials above.

### Option 2: Using Environment Variables (Recommended for Production)

#### Step 1: Create `.env` file
Copy from `.env.example`:
```bash
cp .env.example .env
```

#### Step 2: Edit `.env` with your credentials
```env
# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=your_admin_email@domain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

#### Step 3: Run the script
```bash
python create_admin.py
```

The script will read from your `.env` file automatically.

### Option 3: Using Command-Line Environment Variables
```bash
# Windows PowerShell
$env:ADMIN_USERNAME = "my_admin"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "SecurePass123!"
python create_admin.py

# Windows CMD
set ADMIN_USERNAME=my_admin
set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=SecurePass123!
python create_admin.py

# Linux/Mac
export ADMIN_USERNAME=my_admin
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=SecurePass123!
python create_admin.py
```

## Admin Panel Features

Once logged in, you can:
- ✏️ Create, edit, and delete resumes
- 📊 View all saved resumes
- 🔍 Manage resume data directly
- 📋 See resume counts and metadata

Access at: `http://127.0.0.1:8000/admin/`

## Updated AI Builder Example

The AI resume builder now includes a complete example with all fields:

### Example Input
"I'm Ada Lovelace, ada@analytical.engine. Senior Engineer at Acme (2021–present) working on system design and scalable applications. Skills: TypeScript, React, PostgreSQL. BSc Computer Science from University of Cambridge, 2019. Internships: Product Intern at Stripe, Research Intern at MIT Labs. Projects: AI dashboard for sales forecasting using React and Python. Certifications: AWS Solutions Architect, Scrum Master."

### AI-Filled Fields
The AI builder will now properly extract and populate:
- ✅ **Name**: Ada Lovelace
- ✅ **Email**: ada@analytical.engine
- ✅ **Experience**: Senior Engineer at Acme (2021–present)
- ✅ **Education**: BSc Computer Science, University of Cambridge (2019)
- ✅ **Internships**: Product Intern at Stripe, Research Intern at MIT Labs
- ✅ **Projects**: AI dashboard for sales forecasting using React and Python
- ✅ **Certifications**: AWS Solutions Architect, Scrum Master
- ✅ **Skills**: TypeScript, React, PostgreSQL
- ✅ **Summary**: Generated professionally by AI

## How to Use

### Option 1: Using Admin Panel
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with your credentials
3. Click "Resumes" to manage resume data
4. Add/edit resume entries directly

### Option 2: Using Frontend AI Builder
1. Go to the resume builder at `http://localhost:8080`
2. Click "Try example" to see the Ada Lovelace example
3. Click "Build with AI" to auto-fill all fields
4. Customize as needed
5. Save your resume

## Important Notes

### Fields Now Supported
The AI builder now properly handles:
- Internships
- Projects
- Certifications
- Achievements

All these fields are extracted from your freeform description.

### Best Practices
- **Be specific**: Include company names, dates, and technologies
- **Include all sections**: Mention internships, projects, and certifications
- **Use clear structure**: Separate different roles/experiences with periods or line breaks
- **Mention technologies**: Include programming languages and tools

### Security Best Practices
1. ✅ Use strong passwords (min. 8 characters)
2. ✅ Store credentials in environment variables, NOT in code
3. ✅ Never commit `.env` files to version control
4. ✅ Change default passwords immediately in production
5. ✅ Use `.env.example` as template only

## Troubleshooting

### Admin credentials not working?
Sync or recreate them:
```bash
python create_admin.py
```

### Password too weak?
Ensure password is at least 8 characters long. Try:
```bash
set ADMIN_PASSWORD=SuperSecure@Pass123!
python create_admin.py
```

### AI not extracting all fields?
- Make sure your description includes all sections
- Use clear company names and dates
- Be specific about your role and achievements

## Next Steps

1. ✅ Create admin user: `python create_admin.py`
2. ✅ Test the AI builder with the Ada Lovelace example
3. ✅ Login to admin panel to verify setup
4. ✅ Customize the example for your use case
5. ✅ Change admin password for production use

