const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { db, Project, Task, User } = require('./database/setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// AUTH ROUTES
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

// AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// TEST DB CONNECTION
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}
testConnection();

// PROJECT ROUTES
// Get all projects (ONLY user's projects)
app.get('/api/projects', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { userId: req.session.userId }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get project by ID (ONLY if it belongs to user)
app.get('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findOne({
            where: {
                id: req.params.id,
                userId: req.session.userId
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Create project
app.post('/api/projects', authMiddleware, async (req, res) => {
    try {
        const { name, description, status, dueDate } = req.body;

        const newProject = await Project.create({
            name,
            description,
            status,
            dueDate,
            userId: req.session.userId
        });

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update project (ONLY if owned)
app.put('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description, status, dueDate } = req.body;

        const project = await Project.findOne({
            where: {
                id: req.params.id,
                userId: req.session.userId
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await project.update({ name, description, status, dueDate });

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project (ONLY if owned)
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findOne({
            where: {
                id: req.params.id,
                userId: req.session.userId
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await project.destroy();

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});


// TASK ROUTES 
// Get all tasks
app.get('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create task
app.post('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description, completed, priority, dueDate, projectId } = req.body;

        const newTask = await Task.create({
            title,
            description,
            completed,
            priority,
            dueDate,
            projectId
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});