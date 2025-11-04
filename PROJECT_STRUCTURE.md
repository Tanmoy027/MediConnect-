# MediConnect Project Structure

## Overview
Professional healthcare management system with hospital admin, blood bank, and vaccine management features.

## Directory Structure

### `/lib/controllers` - Business Logic Layer
\`\`\`
lib/controllers/
├── authentication/
│   ├── authController.js      # Login, register, user authentication
│   └── index.js               # Exports
├── hospital/
│   ├── hospitalController.js  # Hospital management
│   ├── appointmentController.js  # Appointment operations
│   ├── vaccineController.js   # Vaccine inventory management
│   ├── emergencyController.js # Emergency services
│   └── index.js               # Centralized exports
├── base/
│   ├── baseController.js      # Base controller with shared methods
│   └── index.js
└── index.js                   # Main controller exports

### `/lib/supabase` - Database Layer
\`\`\`
lib/supabase/
├── server.js      # Server-side Supabase client
├── client.js      # Client-side Supabase client
├── admin.js       # Admin client for privileged operations
└── middleware.js  # Auth middleware
\`\`\`

### `/app/api` - API Routes
\`\`\`
app/api/
├── auth/
│   ├── register/route.js      # User registration
│   ├── login/route.js         # User login
│   ├── logout/route.js        # User logout
│   └── me/route.js            # Current user info
└── hospital/
    ├── admin/
    │   ├── setup/route.js     # Hospital setup
    │   ├── profile/route.js   # Hospital profile
    │   └── stats/route.js     # Dashboard statistics
    ├── appointments/route.js  # Appointment CRUD
    ├── vaccines/route.js      # Vaccine inventory
    └── emergency/route.js     # Emergency services
\`\`\`

### `/app/dashboard` - Hospital Admin Dashboard
\`\`\`
app/dashboard/
├── hospital/
│   ├── page.jsx               # Main hospital dashboard
│   ├── setup/page.jsx         # First-time setup
│   ├── beds/page.jsx          # Bed management
│   └── appointments/          # (Optional future)
└── ...other dashboards
\`\`\`

### `/app/auth` - Authentication Pages
\`\`\`
app/auth/
├── login/page.jsx             # Login page with role routing
├── signup/page.jsx            # Registration page
└── callback/route.js          # Supabase callback
\`\`\`

## Authentication Flow

1. User visits `/auth/signup` or `/auth/login`
2. Credentials sent to API routes
3. Controllers validate and authenticate
4. User role stored in database
5. On login, frontend receives user role
6. User redirected to role-based dashboard:
   - `hospital_admin` → `/dashboard/hospital`
   - `blood_bank_admin` → `/dashboard/blood-bank`
   - `super_admin` → `/dashboard/super-admin`
   - `normal_user` → `/dashboard`

## Hospital Admin Features

### Completed
- Hospital setup and profile management
- Appointment management (CRUD, approve/reject)
- Vaccine inventory management
- Emergency services status
- Dashboard with statistics

### Controllers
- **HospitalController**: Hospital CRUD and statistics
- **AppointmentController**: Appointment management
- **VaccineController**: Vaccine inventory
- **EmergencyController**: Emergency services

## Database Tables (Supabase)
- `users` - User accounts and roles
- `hospitals` - Hospital information
- `appointments` - Doctor appointments
- `vaccine_availability` - Vaccine inventory
- `hospital_beds` - Bed management
- `emergency_requests` - Emergency calls

## Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
\`\`\`

## Key Design Patterns

1. **Controller Pattern**: Business logic separated from routes
2. **Single Responsibility**: Each controller handles one domain
3. **Error Handling**: Standardized error responses via BaseController
4. **Role-Based Access**: Controllers verify user role before operations
5. **Input Validation**: All inputs validated and sanitized
6. **Async/Await**: Modern async patterns throughout
