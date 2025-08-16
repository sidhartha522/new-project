<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# LinkedIn-like Social Media Platform Development Guidelines

## Project Overview
This is a comprehensive professional networking platform similar to LinkedIn, built with React.js frontend and Node.js/Express backend, using MongoDB for data storage.

## Architecture
- **Frontend**: React.js with TypeScript, Tailwind CSS for styling
- **Backend**: Node.js with Express.js, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for messaging and notifications
- **File Upload**: Multer for profile pictures and media

## Key Features
- User authentication and profile management
- Industry-specific profile types (manufacturer, retailer, distributor, contract manufacturer, student, entrepreneur, service provider)
- Social networking features (posts, likes, comments, shares)
- Real-time messaging system
- Professional networking and connections
- Advanced search and filtering
- Content moderation and privacy controls

## Code Style Guidelines
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use Tailwind CSS for consistent styling with LinkedIn-like design
- Implement proper error handling and validation
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow RESTful API conventions for backend endpoints

## Security Considerations
- Always validate and sanitize user inputs
- Implement proper authentication and authorization
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Implement rate limiting for API endpoints

## Database Schema
- Users collection with comprehensive profile information
- Posts collection with engagement metrics
- Messages collection for real-time chat
- Connections collection for networking relationships

## Component Structure
- Use atomic design principles
- Create reusable components for common UI elements
- Implement proper props typing with TypeScript
- Use React Context for global state management

## API Development
- Follow RESTful conventions
- Implement proper HTTP status codes
- Use middleware for authentication and validation
- Document APIs with Swagger/OpenAPI

Please ensure all code follows these guidelines and maintains consistency with the existing codebase.
