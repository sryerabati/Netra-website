# Admin Account Setup

## Creating the Admin Account

To create the admin account with the specified credentials, follow these steps:

### Step 1: Navigate to Django Backend
```bash
cd backend/netra_backend
```

### Step 2: Apply Migrations

Make sure all migrations are applied:
```bash
python manage.py migrate
```

This will:
- Apply the `0003_add_admin_role` migration to add 'admin' to the role choices
- Update the database schema

### Step 3: Create Admin User

Run the admin creation script:
```bash
python create_admin.py
```

This will create an admin account with these credentials:
- **Username:** admin
- **Email:** admin@admin.com
- **Password:** password
- **Full Name:** admin admin
- **Role:** admin

If the user already exists, it will update the existing user to have the admin role.

### Step 4: Start Django Server

```bash
python manage.py runserver
```

## Admin Dashboard Features

The admin account has access to:

### 1. View All Scans
- See every scan in the system regardless of patient, doctor, or nurse
- View complete scan details including:
  - Patient information
  - Doctor and nurse assignments
  - AI predictions for both eyes
  - Priority and status
  - Upload date

### 2. Delete Scans
- Delete any scan from the system
- Confirmation dialog prevents accidental deletion
- Deletion cascades to remove associated images and notes

### 3. System Statistics
- Total scans in the system
- Total users (patients, doctors, nurses, admins)
- Pending scans count
- Urgent scans count

## Login Instructions

1. Navigate to the application
2. Click "Login"
3. Enter credentials:
   - Username: `admin`
   - Password: `password`
4. You will be directed to the Admin Dashboard

## Security Notes

**IMPORTANT:** For production use:
- Change the default password immediately
- Use a strong, unique password
- Consider implementing additional security measures like 2FA
- Never commit credentials to version control

## API Endpoints

Admin-specific endpoints:
- `GET /api/admin/scans/` - Get all scans in the system
- `DELETE /api/admin/scans/<scan_id>/delete/` - Delete a scan
- `GET /api/admin/stats/` - Get system-wide statistics

All endpoints require authentication with an admin role.
