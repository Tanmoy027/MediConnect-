# MediConnect API Documentation

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phone": "9876543210",
    "role": "normal_user" // or hospital_admin, blood_bank_admin, etc.
  }
  \`\`\`
- **Response:** User object with email confirmation status

### Login
- **POST** `/api/auth/login`
- **Body:**
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  \`\`\`
- **Response:** User object with role and details

### Get Current User
- **GET** `/api/auth/me`
- **Authentication:** Required
- **Response:** Current user details

### Logout
- **POST** `/api/auth/logout`
- **Authentication:** Required
- **Response:** Success message

---

## Hospital Admin Endpoints

### Setup Hospital
- **POST** `/api/hospital/admin/setup`
- **Authentication:** Required (hospital_admin role)
- **Body:**
  \`\`\`json
  {
    "name": "Hospital Name",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "City Name",
    "state": "State Name",
    "pincode": "123456"
  }
  \`\`\`
- **Response:** Hospital object

### Get Setup Status
- **GET** `/api/hospital/admin/setup`
- **Authentication:** Required (hospital_admin role)
- **Response:** Hospital object and needsSetup flag

### Get Hospital Profile
- **GET** `/api/hospital/admin/profile`
- **Authentication:** Required (hospital_admin role)
- **Response:** Hospital details

### Update Hospital Profile
- **PUT** `/api/hospital/admin/profile`
- **Authentication:** Required (hospital_admin role)
- **Body:** Any hospital field to update
- **Response:** Updated hospital object

### Get Hospital Statistics
- **GET** `/api/hospital/admin/stats`
- **Authentication:** Required (hospital_admin role)
- **Response:** Comprehensive hospital stats (beds, appointments, vaccines)

---

## Public Hospital Endpoints (No Auth Required)

### List All Hospitals
- **GET** `/api/hospital/public/list`
- **Response:** Array of active hospitals

### Get Hospital Details
- **GET** `/api/hospital/public/[id]`
- **Parameters:** id (hospital ID)
- **Response:** Hospital details

---

## Response Format

All endpoints return standardized responses:

### Success Response
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-11-04T10:30:00.000Z"
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
\`\`\`

---

## Status Codes

- **200**: Successful GET request
- **201**: Successful POST request (resource created)
- **400**: Bad request / validation error
- **401**: Unauthorized / authentication required
- **403**: Forbidden / insufficient permissions
- **404**: Resource not found
- **500**: Internal server error
