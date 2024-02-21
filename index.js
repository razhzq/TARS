require('dotenv').config();
const cors = require("cors");
const express = require("express");
const { createServer } = require("http");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false
})


const db = require("./database/index");


sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

db.sequelize.sync({force: true}).then(() => {
    console.log('drop and rescyn db');
})


const app = express();

const server = createServer(app);


app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);


// app.get("/tokenranking", Token.getTokenRanking);

// app.post("/tweetsbytoken", Tweet.getTweetsByToken);

app.get("/", (_, res) => {
  res.status(200).json("Welcome to Trading Terminal API");
});

server.listen(8080, () => console.log(`app listening on port !`));