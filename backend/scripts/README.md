# Admin Scripts

This directory contains utility scripts for administrative tasks related to the HRM Location Tracker application.

## Available Scripts

### 1. Admin User Creation (`create-admin.js`)

This script checks if an admin user exists in the database, and if not, creates one with the default credentials. It also updates the existing admin's password if the admin already exists.

### 2. Direct Admin Creation (`direct-create-admin.js`)

A standalone version of the admin creation script that defines its own User model schema rather than importing it from the models directory. This is useful in environments where the full backend code may not be available.

### 3. Database Connection Test (`test-db-connection.js`)

Tests the connection to MongoDB and displays information about the database collections and user count. Useful for troubleshooting database connectivity issues.

## Running the Scripts

### For Admin User Creation:

#### Linux/Mac:
```bash
# Navigate to the backend directory
cd hrm-location-tracker/backend

# Make the shell script executable
chmod +x scripts/run-create-admin.sh

# Run the script
./scripts/run-create-admin.sh
```

#### Windows:
```
# Navigate to the backend directory
cd hrm-location-tracker\backend

# Run the batch file
scripts\run-create-admin.bat
```

### For Database Connection Test:
```
# Navigate to the backend directory
cd hrm-location-tracker/backend

# Run the test script
node scripts/test-db-connection.js
```

## Default Admin Credentials
- Email: laxmisah988@gmail.com
- Password: Laxmi@1234#

**Note:** For security purposes, you should change the default admin password after the first login. 