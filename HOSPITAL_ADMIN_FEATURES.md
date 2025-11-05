# MediConnect Hospital Admin Enhancement

This update adds comprehensive functionality to the hospital admin dashboard, including vaccine management and appointment handling.

## New Features

### Hospital Admin Dashboard
- **Tabbed Interface**: Overview, Vaccines, Appointments, and Settings tabs
- **Vaccine Management**: Add, edit, and remove vaccines with inventory tracking
- **Appointment Management**: View, approve, and reject patient appointments
- **Real-time Statistics**: Bed occupancy, pending appointments, vaccine inventory

### API Endpoints

#### Vaccines Management (`/api/vaccines`)

**GET** - Retrieve vaccines for a hospital
\`\`\`
GET /api/vaccines?hospitalId=<uuid>
\`\`\`
Returns vaccines with availability data for the specified hospital.

**POST** - Add new vaccine
\`\`\`json
{
  "name": "COVID-19 Vaccine",
  "manufacturer": "Pfizer",
  "description": "mRNA vaccine for COVID-19",
  "age_group": "18+ years",
  "doses_required": 2,
  "hospitalId": "uuid", // optional if hospital admin
  "available_doses": 100,
  "price": 500.00
}
\`\`\`

**PUT** - Update vaccine availability
\`\`\`json
{
  "availabilityId": "uuid",
  "available_doses": 75,
  "price": 450.00
}
\`\`\`

**DELETE** - Remove vaccine from hospital
\`\`\`
DELETE /api/vaccines?availabilityId=<uuid>
\`\`\`

#### Appointments Management (`/api/appointments`)

**GET** - Retrieve appointments for a hospital
\`\`\`
GET /api/appointments?hospitalId=<uuid>&status=<scheduled|approved|rejected>
\`\`\`
Returns appointments with patient details.

**POST** - Create new appointment
\`\`\`json
{
  "userId": "uuid", // optional, defaults to current user
  "hospitalId": "uuid",
  "appointmentDate": "2024-01-15T10:00:00Z",
  "reason": "General checkup",
  "notes": "Patient notes"
}
\`\`\`

**PUT** - Update appointment status
\`\`\`json
{
  "appointmentId": "uuid",
  "status": "approved", // or "rejected"
  "adminNotes": "Appointment confirmed for 10 AM"
}
\`\`\`

**DELETE** - Cancel appointment
\`\`\`
DELETE /api/appointments?appointmentId=<uuid>
\`\`\`

#### Hospital Information (`/api/hospitals`)

**GET** - Get hospital information
\`\`\`
GET /api/hospitals?hospitalId=<uuid>
GET /api/hospitals // Returns admin's hospital if hospital admin
\`\`\`

#### User Profile (`/api/user/profile`)

**GET** - Get current user profile
\`\`\`
GET /api/user/profile
\`\`\`
Returns authenticated user data with profile information.

## Database Schema Updates

### New Fields Added
- `appointments.admin_notes` - TEXT field for admin notes on appointments

### New Indexes
- Performance indexes on appointments, vaccines, and vaccine_availability tables

## Frontend Components

### Hospital Dashboard (`/dashboard/hospital`)
- **Overview Tab**: Statistics cards and quick action buttons
- **Vaccines Tab**: 
  - Add new vaccines with dialog form
  - Edit existing vaccine availability
  - Delete vaccines from inventory
  - Display vaccine cards with availability status
- **Appointments Tab**:
  - List all appointments with patient details
  - Approve/reject buttons for pending appointments
  - Status badges for visual feedback
- **Settings Tab**: Hospital information display

### Enhanced Vaccine Search (`/vaccines`)
- Client-side search functionality
- Real-time results across all hospitals
- Hospital-specific availability display
- Price and stock information

## Security Features

### Authentication & Authorization
- JWT-based authentication via Supabase
- Role-based access control (hospital_admin role required)
- Row Level Security (RLS) policies on all tables

### API Security
- User authentication validation on all endpoints
- Hospital admin role verification for management operations
- Hospital ownership validation for data access

## Usage Instructions

### For Hospital Admins

1. **Adding Vaccines**:
   - Go to Dashboard → Vaccines tab
   - Click "Add Vaccine" button
   - Fill in vaccine details and inventory information
   - Submit to add to hospital inventory

2. **Managing Appointments**:
   - Go to Dashboard → Appointments tab
   - View all pending appointments
   - Use Approve/Reject buttons to process appointments
   - Patients receive notifications about status changes

3. **Updating Inventory**:
   - Click edit button on any vaccine card
   - Update available doses and pricing
   - Changes are saved immediately

### For Patients

1. **Finding Vaccines**:
   - Go to Vaccines page
   - Search for specific vaccine names
   - View availability across hospitals
   - See pricing and contact information

2. **Booking Appointments**:
   - Use the "Book Appointment" button on vaccine cards
   - Fill in appointment details
   - Wait for hospital admin approval

## Error Handling

All API endpoints include comprehensive error handling:
- 401 Unauthorized for missing authentication
- 403 Forbidden for insufficient permissions
- 404 Not Found for missing resources
- 500 Internal Server Error for server issues

## Testing

To test the functionality:

1. Ensure you have hospital admin role in the database
2. Navigate to `/dashboard/hospital`
3. Test each tab's functionality:
   - Add/edit/delete vaccines
   - View and process appointments
   - Check statistics updates

## Cross-App Compatibility

All API endpoints are designed to be reusable across different applications:
- RESTful design patterns
- Consistent JSON response formats
- Standard HTTP status codes
- Comprehensive error messages

The APIs can be easily integrated into mobile apps, other web applications, or third-party services.
