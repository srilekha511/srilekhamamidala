import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
const profile = {
  name: "Your Name",
  title: "Software Developer",
  bio: "Welcome to my personal website! I'm passionate about building amazing web experiences.",
  email: "your.email@example.com",
  location: "Your City, Country",
  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://twitter.com/yourusername"
  }
};

const projects = [
  {
    id: 1,
    title: "Project One",
    description: "A brief description of your first project.",
    technologies: ["React", "Node.js", "MongoDB"],
    link: "https://github.com/yourusername/project-one",
    image: "https://via.placeholder.com/400x250"
  },
  {
    id: 2,
    title: "Project Two",
    description: "A brief description of your second project.",
    technologies: ["Vue.js", "Express", "PostgreSQL"],
    link: "https://github.com/yourusername/project-two",
    image: "https://via.placeholder.com/400x250"
  },
  {
    id: 3,
    title: "Project Three",
    description: "A brief description of your third project.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    link: "https://github.com/yourusername/project-three",
    image: "https://via.placeholder.com/400x250"
  }
];

const skills = [
  { name: "JavaScript", level: 90 },
  { name: "React", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Python", level: 75 },
  { name: "CSS/HTML", level: 95 },
  { name: "TypeScript", level: 70 }
];

// API Routes
app.get('/api/profile', (req, res) => {
  res.json(profile);
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.get('/api/skills', (req, res) => {
  res.json(skills);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle port conflicts
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`\n💡 Solutions:`);
    console.log(`   1. Kill the process using port ${PORT}:`);
    console.log(`      lsof -ti:${PORT} | xargs kill -9`);
    console.log(`   2. Or use a different port by setting PORT in .env file`);
    console.log(`      Example: PORT=5001\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

