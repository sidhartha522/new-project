# ProNetwork - LinkedIn-like Professional Social Media Platform

A comprehensive professional networking platform designed specifically for manufacturing, retail, and distribution industries. Built with modern web technologies including React.js, Node.js, MongoDB, and TypeScript.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - Secure JWT-based authentication with email verification
- **Industry-Specific Profiles** - Specialized profile types for different industry roles
- **Professional Networking** - Connect with professionals across your industry
- **Real-time Messaging** - Direct messaging with real-time notifications
- **Job Board** - Discover and apply for industry-specific opportunities
- **Social Feed** - Share updates, insights, and engage with your network

### Industry Focus
- **Manufacturers** - Product manufacturing and production companies
- **Retailers** - Retail sales and distribution businesses
- **Distributors** - Product distribution and logistics companies
- **Contract Manufacturers** - Manufacturing services providers
- **Students** - Students and recent graduates
- **Entrepreneurs** - Business owners and startup founders
- **Service Providers** - Professional services and consulting

## 🛠 Technology Stack

### Frontend
- **React.js 18** - Modern React with functional components and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with LinkedIn-inspired design
- **React Router DOM** - Client-side routing
- **React Context API** - State management for authentication
- **Axios** - HTTP client for API calls
- **Heroicons** - Beautiful SVG icons
- **React Query** - Data fetching and caching

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Socket.io** - Real-time messaging
- **express-validator** - Input validation
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting

## 📁 Project Structure

```
/secretapp
├── backend/                 # Node.js backend
│   ├── models/             # Database models
│   │   ├── User.js         # User schema with industry profiles
│   │   ├── Post.js         # Social media posts
│   │   └── Message.js      # Real-time messaging
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js        # User management
│   │   ├── posts.js        # Post management
│   │   ├── connections.js  # Networking features
│   │   └── messages.js     # Messaging system
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication
│   ├── config/             # Configuration
│   │   └── database.js     # MongoDB connection
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point
└── frontend/               # React.js frontend
    ├── src/
    │   ├── components/     # Reusable components
    │   │   ├── Navigation.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Layout.tsx
    │   │   └── ui/         # UI components
    │   ├── pages/          # Page components
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   ├── MessagesPage.tsx
    │   │   ├── NetworkPage.tsx
    │   │   └── JobsPage.tsx
    │   ├── context/        # React Context
    │   │   └── AuthContext.tsx
    │   ├── services/       # API services
    │   │   └── authService.ts
    │   ├── types/          # TypeScript definitions
    │   │   └── index.ts
    │   └── App.tsx         # Main app component
    ├── package.json        # Frontend dependencies
    └── tailwind.config.js  # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secretapp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

4. **Set up environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/pronetwork
   
   # JWT Secret
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Origin (Frontend URL)
   CORS_ORIGIN=http://localhost:3000
   
   # Email Configuration (Optional)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   ```

5. **Start the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm start
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👤 Demo Account

For testing purposes, you can use these demo credentials:
- **Email:** demo@pronetwork.com
- **Password:** demo123

## 🎨 Design System

The application uses a LinkedIn-inspired design system with:

### Colors
- **Primary Blue:** #0A66C2 (LinkedIn Blue)
- **Dark Blue:** #004182
- **Gray Scale:** Various shades for text and backgrounds
- **Success:** Green tones for positive actions
- **Warning:** Orange/Red tones for alerts

### Typography
- **Headings:** Inter font family, various weights
- **Body Text:** System font stack for optimal readability
- **Code:** Monospace fonts for technical content

### Components
- **Buttons:** Primary, secondary, and tertiary styles
- **Cards:** Consistent spacing and shadows
- **Forms:** Clean, accessible input designs
- **Navigation:** Intuitive menu and breadcrumb systems

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - express-validator for API input validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Proper cross-origin request handling
- **Helmet.js** - Security headers and protections

## 📱 Responsive Design

- **Mobile-First** - Designed for mobile devices with progressive enhancement
- **Tablet Support** - Optimized layouts for tablet screens
- **Desktop Experience** - Full-featured desktop interface
- **Touch-Friendly** - Large touch targets and intuitive gestures

## 🔄 Real-time Features

- **Live Messaging** - Socket.io powered real-time chat
- **Notifications** - Instant updates for connections and messages
- **Online Status** - See who's currently active
- **Typing Indicators** - Real-time typing feedback

## 🚀 Performance Optimizations

- **Code Splitting** - Lazy loading of page components
- **Image Optimization** - Responsive images with proper sizing
- **Caching Strategy** - React Query for efficient data caching
- **Bundle Optimization** - Webpack optimizations for production

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for utilities and services
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## 📦 Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# The build folder contains the optimized production build
```

### Environment Configuration
- Set `NODE_ENV=production` for backend
- Configure production MongoDB connection
- Set up proper JWT secrets
- Configure email service for production

### Deployment Options
- **Heroku** - Easy deployment with MongoDB Atlas
- **Vercel/Netlify** - Frontend deployment with serverless functions
- **AWS/GCP/Azure** - Full cloud deployment
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow semantic versioning

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID

### Posts Endpoints
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Connection Endpoints
- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:id/accept` - Accept connection request
- `DELETE /api/connections/:id` - Remove connection

### Message Endpoints
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id/read` - Mark message as read

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify network access and credentials

2. **JWT Token Issues**
   - Check JWT_SECRET in environment variables
   - Verify token expiration settings

3. **CORS Errors**
   - Ensure CORS_ORIGIN is set correctly in backend
   - Check frontend and backend are running on correct ports

4. **Package Installation Errors**
   - Use `--legacy-peer-deps` flag for frontend installation
   - Clear npm cache if needed: `npm cache clean --force`

### Performance Issues
- Check React DevTools for unnecessary re-renders
- Monitor Network tab for slow API calls
- Use React Query DevTools for debugging data fetching

## 📈 Future Enhancements

### Planned Features
- **Advanced Search** - Elasticsearch integration for better search
- **Company Pages** - Business profile pages with employee listings
- **Content Scheduling** - Schedule posts for optimal engagement
- **Analytics Dashboard** - Profile and post analytics
- **Video Content** - Video posts and video calling
- **Mobile App** - React Native mobile application
- **API Rate Limiting** - Advanced rate limiting with Redis
- **Content Moderation** - AI-powered content moderation
- **Integration APIs** - Third-party integrations for CRM systems

### Technical Improvements
- **GraphQL API** - More efficient data fetching
- **Microservices** - Break down monolithic backend
- **Redis Caching** - Advanced caching strategies
- **CDN Integration** - Global content delivery
- **Load Balancing** - Multiple server instances
- **Database Optimization** - Query optimization and indexing

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation wiki
- Review existing issues and discussions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database
- **LinkedIn** - For design inspiration
- **Open Source Community** - For the incredible tools and libraries

---

**ProNetwork** - Connecting professionals in manufacturing, retail, and distribution industries.
