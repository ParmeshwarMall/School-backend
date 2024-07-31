const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public/images")));

main()
  .then(() => {
    console.log("Connection success");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://parmeshwarmall1920:3699@cluster0.uupe2xv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
}

const dataSchema = mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  phone: Number,
  image: String,
});

const Data = mongoose.model("schooldata", dataSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/schools", upload.single("image"), async (req, res) => {
  const { name, email, address, city, state, phone } = req.body;
  const image = req.file ? path.relative("public", req.file.path) : null;

  try {
    const newData = new Data({
      name,
      email,
      address,
      city,
      state,
      phone,
      image,
    });
    await newData.save();
    res.status(201).json({ message: 'School added successfully'})
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/getdata", async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
