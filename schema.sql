-- schema.sql
-- Database schema for the Citizen Reporting Platform

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(50) DEFAULT '#00ffff'
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT,
    user_id INT,
    location VARCHAR(255),
    upvotes INT DEFAULT 0,
    status ENUM('open', 'investigating', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert some default categories relevant to the topic
INSERT IGNORE INTO categories (name, slug, color) VALUES 
('Corruption', 'corruption', '#ff0055'),
('Human Rights', 'human-rights', '#00ffcc'),
('Electoral Fraud', 'electoral-fraud', '#ffaa00'),
('Media Suppression', 'media-suppression', '#bb00ff');
