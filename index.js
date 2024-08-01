const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/schools', upload.single('image'), (req, res) => {
  const { name, email, address, city, state, phone } = req.body;
  const image = fs.readFileSync(req.file.path);

  const sql = 'INSERT INTO data (name, email, address, city, state, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, address, city, state, phone, image], (err, result) => {
    fs.unlinkSync(req.file.path); // Delete the temporary file

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
