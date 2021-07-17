const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());

const dbPath = path.join(__dirname, "userData.db");
let db = null;

const intializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeAndServer();

//1.LOGIN API
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectedUser = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectedUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    if (dbUser.password === password) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//2.POST API
app.post("/", async (request, response) => {
  const { userId, id, title, body } = request.body;
  // console.log(userId, id, title, body);
  const query = `INSERT INTO
        post (userId,id, title,body)
    VALUES
        (${userId},${id},'${title}','${body}');`;
  const userData = await db.run(query);
  response.send("Successfully added");
});

app.get("/posts", async (request, response) => {
  const query = `select * from post;`;
  const userData = await db.all(query);
  response.send(userData);
});

app.delete("/logout", async (request, response) => {
  const query = `DELETE FROM post;`;
  await db.run(query);
  response.send("Data Deleted");
});

module.exports = app;
