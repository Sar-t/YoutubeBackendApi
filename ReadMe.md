# 📺 YouTube Backend API

A backend system built with **Node.js** and **Express** that replicates core YouTube functionalities such as **video uploads, likes, comments, subscriptions, and playlists**. The project includes secure authentication, media handling, and database optimization to provide a scalable and reliable API.

---

## ✨ Features
- 🔐 **User Authentication** – Register, login, JWT-based authentication, and role-based access (user/admin).
- 🎥 **Video Management** – Upload, update, delete, and stream videos with thumbnail support.
- 👍 **Engagement Features** – Likes, comments, and subscriptions system.
- 📂 **Playlists** – Create and manage playlists with multiple videos.
- 📊 **Recommendations** – Trending and recommended videos using MongoDB aggregation.
- ☁️ **Media Storage** – Video and thumbnail uploads with Multer + Cloud Storage (Cloudinary).

---

## 🛠️ Tech Stack
- **Backend Framework:** Node.js, Express  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT, bcrypt  
- **File Handling:** Multer, Cloud Storage (Cloudinary)  
- **Others:** REST API principles, Aggregation Pipelines  

---

## 📂 Project Structure
```
youtube-backend/
│-- src/
│   │-- controllers/    # API request handlers
│   │-- models/         # Mongoose schemas
│   │-- routes/         # API route definitions
│   │-- middlewares/    # Authentication, error handling
│   │-- utils/          # Helper functions
│-- uploads/            # Temporary storage for video uploads
│-- config/             # Database and environment configs
│-- server.js           # Entry point
│-- package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/username/youtube-backend-api.git
cd youtube-backend-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_STORAGE_KEY=your_cloud_storage_key
CLOUD_STORAGE_SECRET=your_cloud_storage_secret
```

### 4. Run the Server
```bash
npm run dev
```

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` → Register new user
- `POST /api/auth/login` → Login and get JWT

### Videos
- `POST /api/videos/upload` → Upload video
- `GET /api/videos/:id` → Get video by ID
- `DELETE /api/videos/:id` → Delete video

### Engagement
- `POST /api/videos/:id/like` → Like video
- `POST /api/videos/:id/comment` → Comment on video
- `POST /api/users/:id/subscribe` → Subscribe to a channel

### Playlists
- `POST /api/playlists` → Create playlist
- `GET /api/playlists/:id` → Get playlist details

---

## 🧪 Testing the API
Use **Postman** or **cURL** to test the endpoints.  
Example:
```bash
curl -X POST http://localhost:5000/api/auth/register   -H "Content-Type: application/json"   -d '{"username":"testuser","email":"test@test.com","password":"123456"}'
```

---

## 🔗 GitHub Repository
👉 [View on GitHub](https://github.com/username/youtube-backend-api)
