const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
const path = require('path');
app.use(express.static(__dirname));

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

// Import Crawler module
const crawler = require('./crawler');

// Start the continuous background news crawler (crawls every 15 minutes)
crawler.startAutoCrawler(15);

// GET all issues (combines database & freshly crawled news)
app.get('/api/issues', async (req, res) => {
    let dbIssues = [];
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
        dbIssues = rows;
    } catch (error) {
        console.log("Database connection unavailable, falling back to crawled news feed.");
    }

    const crawled = crawler.getCrawledIssues();
    const allIssues = [...crawled, ...dbIssues];
    res.json(allIssues);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Ready for cPanel App Manager Deployment`);
});

