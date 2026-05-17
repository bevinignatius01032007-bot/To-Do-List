# Minimalist Productivity Todo App

A minimalist, high-productivity browser-based todo application designed for clarity and intentionality. Supports both mobile and desktop with seamless theme switching and advanced task management.

## Features

### Core Functionality
- **Task Management**: Add tasks with priorities (High, Medium, Low) and categories (Work, Personal, Team)
- **Task Status**: Mark tasks as On-going or Completed
- **Filtering**: Filter by status, priority, and category
- **Archive**: Move completed tasks to archive for long-term storage
- **Swipe to Delete**: Mobile gesture support for quick deletion
- **Progress Tracking**: Visual progress bar and completion percentage
- **Daily Momentum**: Encouraging feedback based on task completion rates

### User Authentication
- **Email/Password**: Simple signup and login
- **Social Auth**: Continue with Google (placeholder - requires backend implementation)
- **Password Recovery**: Forgot Password workflow (placeholder)

### Design & UX
- **Typography**: Inter font for clean, legible hierarchy
- **Themes**: Persistent dark/light mode toggle
- **Mobile-First**: Single-column layout with bottom navigation on mobile
- **Desktop**: Fixed sidebar for navigation and multi-column productivity widgets
- **Color Palette**: Light mode (#F8F9FA surface, #3B82F6 primary), Dark mode (#0C1322 surface)

## File Structure

- `index.html` - Landing page with theme toggle and navigation
- `signup.html` - Registration with social auth and welcome emails
- `login.html` - Login with social auth and password recovery
- `app.html` - Main todo app with advanced features
- `style.css` - Responsive styles with Inter font and new color palettes
- `app.js` - Logic for auth, tasks, themes, progress, and momentum feedback
- `README.md` - This documentation

## Setup

1. Open `index.html` in a browser or use a local server:
   - `python -m http.server 5500`
   - Open `http://localhost:5500`

2. For welcome emails, configure EmailJS:
   - Sign up at https://www.emailjs.com
   - Add a Gmail service (connect your Gmail account)
   - Create a template:
     - Subject: `Welcome to Your Productivity App!`
     - Body: `Hi {{to_name}}, welcome to your minimalist todo app. Stay productive and organized!`
   - Copy your Service ID, Template ID, and Public Key
   - Open `app.js` and replace:
     - `EMAILJS_SERVICE_ID` with your Service ID
     - `EMAILJS_TEMPLATE_ID` with your Template ID
     - `EMAILJS_PUBLIC_KEY` with your Public Key

3. For Google Sign-In (requires backend):
   - Get OAuth 2.0 credentials from Google Cloud Console
   - Replace `YOUR_GOOGLE_CLIENT_ID` in signup.html and login.html
   - Implement server-side OAuth flow for security

## Data Storage

- User accounts, tasks, and archives saved in browser localStorage
- No backend required for core functionality
- Tasks include priority, category, status, and timestamps

## Security Notes

- localStorage is not secure for production use
- Social auth placeholder requires proper OAuth implementation
- Password recovery placeholder needs email service integration
- Consider Firebase Auth or similar for production

## Browser Support

- Modern browsers with ES6+ support
- Touch events for mobile swipe gestures
- localStorage for data persistence

## Troubleshooting

- If no welcome email is received, check the browser console for EmailJS warnings
- Ensure EmailJS keys are set correctly in `app.js`
- Emails only send if the signup page loads the EmailJS script (it does)