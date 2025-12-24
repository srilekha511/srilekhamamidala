# Personal Website Starter Template

A modern, full-stack personal website template with React frontend and Node.js/Express backend.

## Features

- 🎨 Modern, responsive UI design
- ⚡ Fast development with Vite
- 🚀 RESTful API backend
- 📱 Mobile-friendly responsive design
- 🎯 React Router for navigation
- 💼 Project showcase
- 📧 Contact form
- 🎨 Beautiful gradient designs

## Project Structure

```
PersonalWebsite/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   Edit `.env` if needed (default port is 5000)

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload

### Frontend
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Customization

### Update Your Profile

Edit `backend/server.js` to update:
- Your name, title, and bio
- Contact information
- Social media links
- Projects
- Skills

### Styling

The frontend uses CSS variables for easy theming. Edit `frontend/src/index.css` to customize:
- Primary and secondary colors
- Typography
- Spacing and layout

### API Endpoints

The backend provides the following endpoints:
- `GET /api/profile` - Get profile information
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `GET /api/skills` - Get skills list
- `GET /api/health` - Health check

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in your `.env` file
2. Run `npm start`

### Frontend
1. Build the project: `npm run build`
2. The `dist` folder contains the production-ready files
3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## Technologies Used

- **Frontend:**
  - React 18
  - React Router
  - Vite
  - Axios
  - CSS3

- **Backend:**
  - Node.js
  - Express
  - CORS
  - dotenv

## License

This project is open source and available under the MIT License.

## Support

Feel free to customize this template to fit your needs. Update the content, add new features, and make it your own!

# personal-website
