# MediCompare Backend API

Backend server for MediCompare healthcare price transparency platform.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: express-validator

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory (already created):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicompare
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Install & Start MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or install via chocolatey:
choco install mongodb
```

**Start MongoDB:**
```bash
mongod
```

### 4. Seed Database (Optional)
```bash
node seedDatabase.js
```

### 5. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Hospitals
- `GET /api/hospitals` - Get all hospitals (supports query params: search, location, verified, minRating)
- `GET /api/hospitals/:id` - Get single hospital
- `POST /api/hospitals` - Create hospital (Admin only, requires auth)
- `PUT /api/hospitals/:id` - Update hospital (Admin only, requires auth)
- `DELETE /api/hospitals/:id` - Delete hospital (Admin only, requires auth)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### File Upload
- `POST /api/upload/hospital-logo` - Upload hospital logo (Admin only)
- `POST /api/upload/hospital-image` - Upload hospital images (Admin only)
- `POST /api/upload/avatar` - Upload user avatar (requires auth)
- `POST /api/upload/medical-report` - Upload medical reports (requires auth)
- `POST /api/upload/multiple` - Upload multiple files (Admin only)

## File Upload Usage

Example using fetch API:
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Authentication Flow

1. **Register**: POST to `/api/auth/register` with name, email, password
2. **Login**: POST to `/api/auth/login` with email, password
3. **Get Token**: Server returns JWT token
4. **Use Token**: Include in Authorization header: `Bearer <token>`

## Project Structure
```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── authMiddleware.js  # JWT authentication
│   └── uploadMiddleware.js # Multer file upload
├── models/
│   ├── Hospital.model.js  # Hospital schema
│   └── User.model.js      # User schema
├── routes/
│   ├── auth.routes.js     # Auth endpoints
│   ├── hospitals.routes.js # Hospital endpoints
│   └── upload.routes.js   # Upload endpoints
├── uploads/               # Uploaded files storage
├── .env                   # Environment variables
├── package.json           # Dependencies
├── seedDatabase.js        # Database seeder
└── server.js             # Main server file
```

## Security Features
- Password hashing with bcryptjs
- JWT token authentication
- File type validation
- File size limits (5MB)
- CORS configuration
- Protected routes

## Notes
- Uploaded files are stored in `backend/uploads/` directory
- For production, consider using cloud storage (AWS S3, Cloudinary)
- Change JWT_SECRET in production
- Use proper MongoDB connection string for production
