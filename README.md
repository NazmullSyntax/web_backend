# Note Management System

A full-stack web application for managing personal and shared notes with user authentication, role-based access control, and file upload capabilities.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Note Management**: Create, read, update, and delete notes
- **Note Visibility**: Public and private note statuses
- **Search Functionality**: Search notes by title (case-insensitive)
- **Responsive UI**: Built with React and Tailwind CSS

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- dotenv for environment variables

### Frontend
- React
- Tailwind CSS
- Axios for API calls
- React Router for navigation

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (unique)
- password (hashed)
- role (admin | user)
- createdAt
- updatedAt

### Notes Table
- id (Primary Key)
- title
- description
- date
- userId (Foreign Key → users)
- createdAt
- updatedAt

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get logged-in user profile (protected)
- `DELETE /auth/:id` - Delete user (admin only)
- `GET /auth` - Get all users (admin only)

### Notes
- `POST /api/notes` - Create a new note (user)
- `GET /api/notes` - Get all notes (filtered by permissions)
- `GET /api/notes/:id` - Get a specific note by ID
- `PUT /api/notes/:id` - Update a note (owner only)
- `DELETE /api/notes` - Delete all notes (admin only)
- `DELETE /api/notes/:id` - Delete a note (owner or admin)
- `GET /api/notes/search?name=value` - Search notes by title (case-insensitive)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd note-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `note_db`

4. Update the `.env` file with your database credentials:
   ```
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your_jwt_secret
   ```

5. Run the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd note-management-system/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Register a new account or login with existing credentials
2. Create notes with title, description, and optional date
3. Search for notes by title (case-insensitive) on the dashboard
4. Edit or delete your own notes
5. Admin users can manage all users and notes

## Postman Testing

### Authentication
1. **Register**: `POST http://localhost:5000/auth/register`
   - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`

2. **Login**: `POST http://localhost:5000/auth/login`
   - Body: `{ "email": "john@example.com", "password": "password123" }`
   - Copy the returned JWT token

3. **Set Authorization**: For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer <your_jwt_token>`

### Notes
1. **Create Note**: `POST http://localhost:5000/api/notes`
   - Headers: Authorization
   - Body: `{ "title": "My Note", "description": "Note description", "date": "2023-01-01" }`

2. **Get All Notes**: `GET http://localhost:5000/api/notes`
   - Headers: Authorization

3. **Search Notes**: `GET http://localhost:5000/api/notes/search?name=My`
   - Headers: Authorization

4. **Update Note**: `PUT http://localhost:5000/api/notes/:id`
   - Headers: Authorization
   - Body: `{ "title": "Updated Note", "description": "Updated description", "date": "2023-01-02" }`

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- File type validation for uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.