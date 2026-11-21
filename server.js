const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serves Login.html, Register.html, and styles.css

// 1. Connect to your MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Siva12345@', // <-- Replace with your MySQL password
    database: 'user_auth'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL user_auth database!');
});

// 2. Serve the Login page by default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html'));
});

// 3. Handle Registration (Update column/field names below to match Register.html)
app.post('/register', async (req, res) => {
    const { Firstname, Lastname, email, password, ConfirmPassword, PhoneNumber, Address } = req.body;
    if (password !== ConfirmPassword) {
        return res.send('Passwords do not match!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (first_name, last_name, email, password, phone, address) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [Firstname, Lastname, email, hashedPassword, PhoneNumber, Address], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Error registering user. Email might already exist.');
        }
        res.redirect('/Login.html');
    });
});

// 4. Handle Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.send('User not found!');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.send(`Welcome back, ${user.name || user.email}! Login successful.`);
        } else {
            res.send('Incorrect password!');
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});