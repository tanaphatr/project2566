const express = require('express');
const db = require('./Connect.js'); // นำเข้าโมดูลที่เชื่อมต่อกับ SQL Server
const multer = require('multer');
const path = require('path');
const sharedData = {};
const cors = require('cors');

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));



const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, 'public/images')
  },
  filename: (req, file, cd) => {
    cd(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type ,Accept');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello, was show data');
});

//=========================================================================================================================
//รับค่าจาก sql รับ table users ไปแสดงไว้บน server
//=========================================================================================================================

app.get("/User", async (req, res) => {
  try {

    const User = await db.query("SELECT * FROM Users");

    res.status(200).json(User);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


//=========================================================================================================================
//รับค่าจาก server แล้วนำไปใส่ใน sql table users
//=========================================================================================================================

app.post("/Create", async (req, res) => {
  try {
    const Name = req.body.Name;
    const Email = req.body.Email;
    const Username = req.body.Username;
    const Password = req.body.Password;
    const User_type = req.body.User_type;
    console.log(req.body);
    console.log(Name, Email, Username, Password, User_type);

    const queryString = `INSERT INTO Users (Name, Email, Username, Password, User_type) VALUES ('${Name}', '${Email}', '${Username}', '${Password}', ${User_type})`;
    // const queryString = `INSERT INTO Users (Name, Email, Username, Password, User_type) VALUES ('tanakorn', 'tanakorn@mbsbiz.co.th', 'tanakotnW', '123456', 1)`;
    console.log(queryString);

    const Create = await db.query(
      queryString
    );

    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});

//=========================================================================================================================
//รับค่าจาก sql รับ table Categories ไปแสดงไว้บน server
//=========================================================================================================================

app.get("/Categories", async (req, res) => {
  try {

    const Categories = await db.query("SELECT * FROM Categories");

    res.status(200).json(Categories);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


//=========================================================================================================================
//รับค่าจาก sql รับ table Body_parts ไปแสดงไว้บน server
//=========================================================================================================================

app.get("/Parts", async (req, res) => {
  try {

    const Parts = await db.query("SELECT * FROM Body_parts");

    res.status(200).json(Parts);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//=========================================================================================================================
//รับค่าจาก sql รับ table Exercises ไปแสดงไว้บน server
//=========================================================================================================================

app.get("/Exercises", async (req, res) => {
  try {

    const Exercises = await db.query("SELECT * FROM Exercises");

    res.status(200).json(Exercises);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//=========================================================================================================================
//รับค่าจาก sql รับ table Images ไปแสดงไว้บน server
//=========================================================================================================================

app.get("/Images", async (req, res) => {
  try {

    const Images = await db.query("SELECT * FROM Images");

    res.status(200).json(Images);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


// =========================================================================================================================
// รับค่าจาก server แล้วนำไปใส่ใน sql table Exercises and Images   '${Image}' 
// =========================================================================================================================

app.post("/uploadText", async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Data available in /uploadText:', sharedData);
    const Title = req.body.Title;
    const Description = req.body.Description;
    const selectedCate = req.body.selectedCate;
    const selectedParts = req.body.selectedParts;
    const Imagename = req.body.Imagename;
    const Image = sharedData.imgfilename;

    console.log('Image in /uploadText:', Image);
    console.log(req.body);

    const queryString1 = `INSERT INTO Exercises (title, description, category_name, parts_name ,Image_name) VALUES ('${Title}', '${Description}', '${selectedCate}', '${selectedParts}','${Imagename}')`;
    console.log(queryString1);

    const queryString2 = `INSERTs ( INTO Image Image_data ,Image_name) VALUES ('${Image}','${Imagename}')`;
    console.log(queryString2);

    const Exercises = await db.query(
      queryString1
    );

    const Images = await db.query(
      queryString2
    );


    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});

//=========================================================================================================================
//Multer
//=========================================================================================================================

app.post('/upload', upload.single('Image'), async (req, res) => {
  try {
    const imgfilename = req.file.filename;
    sharedData.imgfilename = imgfilename;

    console.log('Data stored in /upload:', sharedData);
    console.log('imgfilename in /upload:', imgfilename);

    await new Promise(resolve => setTimeout(resolve, 2000));

    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =========================================================================================================================
// show image
// =========================================================================================================================

app.use('/public/images', express.static(path.join(__dirname, 'public/images')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// =========================================================================================================================
// Delete  
// =========================================================================================================================

app.delete('/delete', (req, res) => {
  const Image_ID = req.body.Image_ID;
  const Exercise_ID = req.body.Exercise_ID;
  console.log(req.body)
  console.log(Image_ID)
  console.log(Exercise_ID)

  db.query(`DELETE FROM Exercises WHERE Exercise_ID = ${Exercise_ID}`, (error, results) => {
    if (error) {
      console.error("Error deleting from Exercises table:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Deleted from Exercises table:", results);
  });
  db.query(`DELETE FROM Images WHERE Image_ID = ${Image_ID}`, (error, results) => {
    if (error) {
      console.error("Error deleting from Images table:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Deleted from Images table:", results);
  });
  res.status(200).json({ success: true });
    
  
});

//=========================================================================================================================
//Edit
//=========================================================================================================================

app.put('/Edit', upload.single('Image'), async (req, res) => {
  try {
    const imgfilename = req.file.filename;
    sharedData.imgfilename = imgfilename;
    console.log(imgfilename)
    console.log('Data stored in /Edit:', sharedData);
    console.log('imgfilename in /Edit:', imgfilename);

    await new Promise(resolve => setTimeout(resolve, 2000));

    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =========================================================================================================================
// รับค่าจาก server แล้วนำไปใส่ใน sql table Exercises and Images   '${Image}' 
// =========================================================================================================================

app.put("/EditImgname", async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Data available in /EditImgname:', sharedData);
    const Image_ID = req.body.Image_ID
    const Image = sharedData.imgfilename;

    console.log('Image in /EditImgname:', Image);
    console.log(req.body);

    const queryString2 = `UPDATE Images SET Image_data = '${Image}' WHERE Image_ID = ${Image_ID}`;
    console.log(queryString2);

    const ImagesEdit = await db.query(
      queryString2
    );

    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});

// =========================================================================================================================
// รับค่าจาก server แล้วนำไปใส่ใน sql table Exercises and Images   '${Image}'
// =========================================================================================================================

app.put("/EditExercise", async (req, res) => {
  try {
    const Exercises_ID = req.body.Exercises_ID;
    const Title = req.body.Title;
    const Description = req.body.Description;
    const selectedCate = req.body.selectedCate;
    const selectedParts = req.body.selectedParts;
    const Image_name = req.body.Image_name;
    const Image_name2 = req.body.Image_name;
    const Image_ID = req.body.Image_ID;

    console.log(req.body);

    const queryString1 = `UPDATE Exercises SET title = '${Title}', description = '${Description}', category_name = '${selectedCate}', parts_name = '${selectedParts}', Image_name = '${Image_name}' WHERE Exercise_ID = ${Exercises_ID}`;
    console.log(queryString1);

    const ExercisesEdit = await db.query(
      queryString1
    );

    const queryString2 = `UPDATE Images SET Image_name = '${Image_name2}' WHERE Image_ID = ${Image_ID}`;
    console.log(queryString2);

    const ImagesEdit = await db.query(
      queryString2
    );

    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});

// =========================================================================================================================
// Local run console log
// =========================================================================================================================

app.put("/EditUser", async (req, res) => {
  try {
    const User_ID = req.body.User_ID;
    const Name = req.body.Name;
    const Email = req.body.Email;
    const Username = req.body.Username;
    const Password = req.body.Password;
    const User_Type = req.body.User_Type;

    console.log(req.body);

    const queryString10 = `UPDATE Users SET Name = '${Name}', Email = '${Email}', Username = '${Username}', Password = '${Password}' , User_Type = ${User_Type} WHERE User_ID = ${User_ID}`;
    console.log(queryString10);

    const UserEdit = await db.query(
      queryString10
    );

    return res.status(201).json({ message: "New user successfully created!" });
  } catch (err) {
    console.log("Error while inserting a user into the database", err);
    return res.status(400).send();
  }
});



app.delete('/deleteUser', (req, res) => {
  const User_ID = req.body.User_ID;

  db.query(`DELETE FROM Users WHERE User_ID = ${User_ID}`, (error, results) => {
    if (error) {
      console.error("Error deleting from Exercises table:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Deleted from Exercises table:", results);
  });
  res.status(200).json({ success: true });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});