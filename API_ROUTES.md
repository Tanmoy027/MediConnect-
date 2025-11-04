# MediConnect API Routes Documentation

## Authentication Routes
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user and get role
- **GET** `/api/auth/me` - Get current authenticated user
- **POST** `/api/auth/logout` - Logout user

## Hospital Admin Routes
- **POST** `/api/hospital/admin/setup` - Create hospital (first-time setup)
- **GET** `/api/hospital/admin/setup` - Check if hospital setup is needed
- **GET** `/api/hospital/admin/profile` - Get hospital details
- **PUT** `/api/hospital/admin/profile` - Update hospital information
- **GET** `/api/hospital/admin/stats` - Get hospital dashboard statistics

## Hospital Appointments
- **GET** `/api/hospital/appointments` - Get all appointments for hospital
- **POST** `/api/hospital/appointments` - Create new appointment
- **PUT** `/api/hospital/appointments` - Update appointment status
- **DELETE** `/api/hospital/appointments` - Delete appointment

## Hospital Vaccines
- **GET** `/api/hospital/vaccines` - Get all vaccines for hospital
- **POST** `/api/hospital/vaccines` - Add new vaccine to hospital
- **PUT** `/api/hospital/vaccines` - Update vaccine availability
- **DELETE** `/api/hospital/vaccines` - Remove vaccine from hospital

## Hospital Emergency Services
- **GET** `/api/hospital/emergency` - Get emergency statistics and requests
- **PUT** `/api/hospital/emergency` - Update emergency services status

## Public Hospital Routes
- **GET** `/api/hospital/public/list` - Get all active hospitals
- **GET** `/api/hospital/public/[id]` - Get specific hospital details

## Controller Layer Structure
\`\`\`
lib/controllers/
├── authentication/
│   ├── authController.js
│   └── index.js
├── hospital/
│   ├── hospitalController.js
│   ├── appointmentController.js
│   ├── vaccineController.js
│   ├── emergencyController.js
│   └── index.js
├── base/
│   ├── baseController.js
│   └── index.js
└── index.js
\`\`\`

## Authentication Flow
1. User registers/logs in
2. Supabase creates auth session
3. User record created in database with role
4. Frontend receives user role
5. User redirected to appropriate dashboard based on role
