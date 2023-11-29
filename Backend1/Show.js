const express = require('express');
const db = require('./Connect.js'); // นำเข้าโมดูลที่เชื่อมต่อกับ SQL Server

const app = express();
const port = 3001;
app.use(express.json());

app.use((req ,res , next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type ,Accept');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello, /read was show data');
});

app.post("/create", async (req, res) => {
  const { Name, Email, Username, Password, User_type } = req.body;

  try {
    // ใช้ connection pool จาก app.js
    const result = await db.query(
      "INSERT INTO Users(User_ID, Name, Email, Username, Password, User_type) VALUES(?, ?, ?, ?, ?, ?)",
      [ Name, Email, Username, Password, User_type]
    );

    // ในกรณีที่คิวรีประสบความสำเร็จ
    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});

app.get("/read", async (req, res) => {
  try {
    // ใช้ connection pool จาก app.js
    const results = await db.query("SELECT * FROM Users");

    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
