const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
// IMPORTANT: Update these credentials to match your Interserver cPanel MySQL setup
const dbConfig = {
    host: 'localhost',
    user: 'your_cpanel_db_user',
    password: 'your_cpanel_db_password',
    database: 'your_cpanel_db_name'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'VOICE API is running.' });
});

// GET all issues
app.get('/api/issues', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                issues.id, 
                issues.title, 
                issues.description, 
                issues.location, 
                issues.upvotes, 
                categories.name as category,
                categories.color as category_color
            FROM issues
            LEFT JOIN categories ON issues.category_id = categories.id
            ORDER BY issues.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST a new issue
app.post('/api/issues', async (req, res) => {
    const { title, description, category_id, location } = req.body;
    
    // Basic validation
    if (!title || !description || !category_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO issues (title, description, category_id, location) VALUES (?, ?, ?, ?)',
            [title, description, category_id, location]
        );
        res.status(201).json({ id: result.insertId, message: 'Issue reported successfully' });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upvote an issue
app.post('/api/issues/:id/upvote', async (req, res) => {
    const issueId = req.params.id;
    try {
        await pool.query('UPDATE issues SET upvotes = upvotes + 1 WHERE id = ?', [issueId]);
        res.json({ message: 'Upvoted successfully' });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Ready for cPanel App Manager Deployment`);
});
