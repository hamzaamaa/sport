const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'demo-rds-database.c3mq2e42ibnd.eu-central-1.rds.amazonaws.com',
    user: 'rdsuser',
    password: 'admin123456',
    database: 'rdsdb',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error('DB connection error: ', err);
        return;
    }
    console.log('DB connected!');
});

const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
        user: 'isport2.0@outlook.de',
        pass: '100200300Sm'
    }
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        const mailOptions = {
            from: 'isport2.0@outlook.de',
            to: email,
            subject: 'Account Verification',
            text: 'Please verify your account'
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Error sending email');
            }
            res.status(200).send('Registration successful, verification email sent!');
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        if (results.length > 0) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.post('/delete', (req, res) => {
    const { email } = req.body;
    const query = 'DELETE FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).send('Account deleted successfully');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});