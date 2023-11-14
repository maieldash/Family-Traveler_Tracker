import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "123456@",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let currentColor = "";
let currentUser = {};
let users = [];
let countries = [];
async function checkVisisted() {
  console.log("check visited countries");

  const result = await db.query("SELECT c.countrycode code , u.color color, u.name uname FROM visited_countries c join users u on u.id = c.user_id where c.user_id = $1",[currentUserId]);
  console.log(result.rows);
  let countries = [];
  result.rows.forEach((record) => {
    countries.push(record.code);
  });
  return countries;
}
async function checkUsers() {
  console.log("check users");
  const result = await db.query("SELECT * from users");
  return result.rows;
}
async function setDefaultUser(req,res,next) {
  const result = await db.query("SELECT * from users where id = $1", [currentUserId]);
  currentUser = result.rows[0];
  console.log(currentUser);
  currentColor = currentUser.color;
  next();
}
app.use(setDefaultUser);
app.get("/", async (req, res) => {
  console.log("check");
  countries = await checkVisisted();
  users = await checkUsers();
  console.log(users);
  console.log(currentColor);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentColor,
  });
});
app.post("/add", async (req, res) => {
  const countryName = req.body.country;
  console.log(countryName);
  try {
    const result = await db.query(
      "SELECT countrycode FROM countries WHERE LOWER(countryname) LIKE '%' || $1 || '%';",
      [countryName.toLowerCase()]
    );

    const country_code= result.rows[0].countrycode;
    console.log(country_code);
    try {
      await db.query(
        "INSERT INTO visited_countries (countrycode,user_id) VALUES($1,$2)",
        [country_code,currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      res.render("index.ejs", {
        error:"The country you entered is already visited, Try another one!",
        countries: countries,
        total: countries.length,
        users: users,
        color: currentColor,
      });
    }
  } catch (err) {
    console.log(users);
    res.render("index.ejs", {
      error: "The country you entered doesn't exist, Try another one!",
      countries: countries,
      total: countries.length,
      users: users,
      color: currentColor,
    });
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add) {
    res.render("new.ejs");
  }
  else {
    currentUserId = req.body.user;
    console.log(currentUserId);
    currentUser = users.find(function (user) {
      return user.id == currentUserId;
    });
    console.log(currentUser);
    currentColor = currentUser.color;
    res.redirect("/");
  }
  
});

app.post("/new", async (req, res) => {
  let name = req.body.name;
  let color = req.body.color;
  let newUser = await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *", [name, color]);
  console.log("new user");
  console.log(newUser.rows[0]);
  currentUser = newUser.rows[0];
  currentColor = newUser.rows[0].color;
  currentUserId = newUser.rows[0].id;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
