-- MySQL initialization script
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
    ('Ana Martínez', 'ana@example.com'),
    ('Pedro Sánchez', 'pedro@example.com'),
    ('Laura Fernández', 'laura@example.com');

INSERT INTO products (name, price, stock) VALUES 
    ('Monitor', 299.99, 15),
    ('Webcam', 89.99, 25),
    ('Headphones', 149.99, 20);
