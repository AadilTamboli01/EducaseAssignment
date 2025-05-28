import mysql from "mysql2";
import express from "express";
let app = express();
import dotenv from "dotenv";
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Aadil@123456",
//   database: "School",
// });

// const connection = mysql.createConnection({
//   host: "sql12.freesqldatabase.com",
//   user: "sql12781717",
//   password: "6QqqSewYAM",
//   database: "sql12781717",
//   port: 3306,
// });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Will be a string, but mysql2 handles it
});

app.get("/getSchools", (req, res) => {
  try {
    // For GET requests, use req.query (not req.body)
    let { latitude, longitude } = req.query;

    // Ensure latitude and longitude are numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }
   


    const q = `
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        6371 * acos(
          cos(radians(?)) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) *
          sin(radians(latitude))
        ) AS distance_km
      FROM Schools
      ORDER BY distance_km ASC
    `;

    // Use parameterized query to prevent SQL injection
    connection.query(q, [latitude, longitude, latitude], (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.send({
        result: result,
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/addSchool", (req, res) => {
  const { id, name, address, latitude, longitude } = req.body;

  // Basic validation
  if (
    !id ||
    !name ||
    !address ||
    typeof latitude === "undefined" ||
    typeof longitude === "undefined"
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = `
    INSERT INTO Schools (id, name, address, latitude, longitude)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Use parameterized query to prevent SQL injection
  connection.query(
    query,
    [id, name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        // Handle duplicate key or other DB errors
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "School added successfully!", schoolId: id });
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log("app started listning on port 3000");
});
