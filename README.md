# HRM Location Tracker

A comprehensive human resource management system with staff location tracking capabilities.

## Project Structure

This project consists of three main components:

1. **Backend API** - Node.js/Express API with MongoDB
2. **Web Dashboard** - React-based admin dashboard
3. **Mobile App** - React Native app for staff to track their locations

## Features

- User authentication with role-based access control (Admin, Company, Staff)
- Real-time location tracking for staff
- Check-in and check-out functionality
- Dashboard with analytics
- Staff management
- Location history visualization

## Technical Stack

### Backend
- Node.js and Express
- MongoDB with Mongoose ODM
- JWT authentication
- RESTful API

### Web Dashboard
- React.js
- Material UI
- React Router
- Axios for API communication
- Context API for state management

### Mobile App
- React Native with Expo
- React Navigation
- Expo Location API
- React Native Maps
- React Native Paper

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Admin Credentials
The system comes pre-configured with an admin account:
- **Email:** laxmisah988@gmail.com
- **Password:** Laxmi@1234#

These credentials can be used to log in to the web dashboard as an administrator.

### Installation and Setup

#### Backend

```bash
cd hrm-location-tracker/backend
npm install
# Update .env file with your MongoDB connection string
npm run dev
```

#### Web Dashboard

```bash
cd hrm-location-tracker/web-dashboard
npm install
# Update src/utils/config.js with your backend API URL
npm start
```

#### Mobile App

```bash
cd hrm-location-tracker/mobile-app
npm install
# Update src/config.js with your backend API URL
npm start
```

## Usage

1. Log in with the admin credentials or register as a company admin
2. Add staff users
3. Staff users can log in via the mobile app
4. Staff can check-in, check-out, and have their locations tracked
5. Company admins can view staff locations and activity on the dashboard

## License

MIT

## Credits

Developed by [Your Name/Company] 