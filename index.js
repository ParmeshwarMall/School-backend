const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Parmeshwar1920@#',
  database: 'SchoolData'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/schools', upload.single('image'), (req, res) => {
  const { name, email, address, city, state, phone } = req.body;

  const image = req.file ? path.relative('public', req.file.path) : null;

  const sql = 'INSERT INTO data (name, email, address, city, state, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, address, city, state, phone, image], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
  });
});

app.get('/getdata', (req, res) => {
  const sql = 'SELECT * FROM data';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
