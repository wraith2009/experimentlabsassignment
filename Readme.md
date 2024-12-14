# Calendar App

## Description

A simple calendar application that allows users to create, view, edit, and delete events or meetings on their personal calendar. The application includes user authentication to ensure secure access and provides a user-friendly interface with a calendar view for better event management.

## Features

### Core Features

1. **User Authentication:**

   - Users can sign up and log in using secure authentication services like Firebase/Auth0.
   - Each user has access to manage only their own calendar events.

2. **Calendar Event Management:**

   - **Create:** Add new events with details such as Title, Date & Time, and Description.
   - **View:** See a list of all events or view them on a calendar interface.
   - **Edit:** Modify existing event details.
   - **Delete:** Remove events from the calendar.

3. **Calendar View:**
   - Display events in a monthly or weekly calendar view for better organization.

## Tech Stack

### Frontend

- **ReactJS**
  - Used to build a responsive and intuitive user interface.

### Backend

- **NodeJS**
  - REST API for handling CRUD operations.
- **Database:**
  - PostgreSQL for storing user-specific events securely.
- **Authentication Service:**
  - Oauth for user authentication.

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL/MySQL

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/wraith2009/experimentlabsassignment
   cd experimentlabsassignment/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<your-jwt-secret>
   AUTH_PROVIDER=<your-auth-service-config>
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd calendar-app/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   REACT_APP_API_URL=<your-backend-api-url>
   REACT_APP_AUTH_PROVIDER=<your-auth-service-config>
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Screenshots

1. **Calendar View**

   - Displays a monthly or weekly view of events.

2. **Event Form**

   - Create or edit events with ease.

3. **Event List View**
   - View all events in a tabular format.

## Live Demo

- Access the deployed application here: [https://experimentlabsassignment-tak1.vercel.app/](#)

## License

This project is licensed under the MIT License.

---

Thank you for using the Calendar App!
