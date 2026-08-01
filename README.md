# MediCompare - Healthcare Price Transparency Platform

## 🏥 Complete Professional Website

A modern, AI-powered healthcare platform for comparing medical service prices across multiple hospitals.

## ✨ Features

- **3D AI Aesthetic**: Futuristic design with glassmorphism, neon glows, and smooth animations
- **Real-Time Price Comparison**: Compare prices across 50+ verified hospitals
- **Image Upload**: Upload medical reports with drag-and-drop functionality
- **AI Analysis**: Automated price analysis and recommendations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Backend API**: Full REST API with authentication and file uploads
- **Database Integration**: MongoDB for scalable data storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running

### Installation

1. **Clone/Copy the project folder**

2. **Install Frontend Dependencies**
```bash
cd c:/Healthcare
npm install
```

3. **Install Backend Dependencies**
```bash
cd c:/Healthcare/backend
npm install
```

4. **Start MongoDB**
```bash
mongod
```

5. **Seed the Database** (Optional - populate with sample data)
```bash
cd c:/Healthcare/backend
node seedDatabase.js
```

6. **Start Backend Server**
```bash
cd c:/Healthcare/backend
npm start
# Server runs on http://localhost:5000
```

7. **Start Frontend** (in a new terminal)
```bash
cd c:/Healthcare
npm run dev
# Frontend runs on http://localhost:5173
```

8. **Open your browser** and visit: `http://localhost:5173`

## 📁 Project Structure

```
c:/Healthcare/
├── backend/                    # Backend API
│   ├── config/                # Database configuration
│   ├── middleware/            # Auth & Upload middleware
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── uploads/               # Uploaded files storage
│   ├── server.js              # Main server file
│   ├── seedDatabase.js        # Database seeder
│   └── package.json
│
├── src/                       # Frontend React app
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── Hero.jsx           # Hero section
│   │   ├── Features.jsx       # Features showcase
│   │   ├── Stats.jsx          # Statistics section
│   │   ├── ImageUpload.jsx    # File upload component
│   │   ├── HospitalList.jsx   # Hospital cards
│   │   └── Footer.jsx         # Footer section
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   └── index.css              # Global styles
│
└── package.json               # Frontend dependencies
```

## 🎨 Tech Stack

### Frontend
- React + Vite
- Vanilla CSS (no frameworks)
- Lucide React Icons
- Fetch API for backend integration

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File uploads)
- bcryptjs (Password hashing)

## 🌐 API Endpoints

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get single hospital
- `POST /api/hospitals` - Create hospital (admin)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile

### File Upload
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/medical-report` - Upload medical report
- `POST /api/upload/hospital-logo` - Upload hospital logo

## 📊 Database

The website uses MongoDB with two main collections:
- **Hospitals**: Hospital data with services and pricing
- **Users**: User accounts with authentication

Initial data includes 4 sample hospitals with realistic pricing.

## 🎯 Key Features Implemented

✅ Glassmorphism UI with 3D effects  
✅ Responsive navigation bar  
✅ Hero section with animated background  
✅ Features showcase  
✅ Live statistics  
✅ Drag-and-drop file upload  
✅ Hospital price comparison cards  
✅ Professional footer  
✅ Backend REST API  
✅ JWT authentication  
✅ Image upload functionality  
✅ MongoDB integration  
✅ Real-time data fetching  

## 🔧 Configuration

### Environment Variables (.env)
Located in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicompare
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🎨 Design System

- **Primary Color**: Cyan (#00f0ff)
- **Secondary Color**: Purple (#7000ff)
- **Background**: Deep dark (#05050a)
- **Typography**: Inter font family
- **Effects**: Glassmorphism, neon glows, smooth transitions

## 📝 Usage

1. **Browse Hospitals**: Scroll down to see all available hospitals
2. **Upload Report**: Use the upload section to submit medical documents
3. **Compare Prices**: View pricing differences across hospitals
4. **Register/Login**: Use the backend API for user authentication

## 🚀 Deployment

For production deployment:
1. Build the frontend: `npm run build`
2. Use the `dist/` folder for static hosting
3. Deploy backend to a Node.js hosting service
4. Use MongoDB Atlas for cloud database
5. Update environment variables for production

## 📞 Support

For issues or questions:
- Email: info@medicompare.com
- Phone: +1 (555) 123-4567

## 📜 License

© 2026 MediCompare. All rights reserved.

---

**Built with ❤️ using React, Express, and MongoDB**
