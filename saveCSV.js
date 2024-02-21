require("dotenv").config();

const fs = require("fs");
const csv = require("csv-parser");
const filePath = "./accountlist.csv";

const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
});

const account = require("./database/account.model")(sequelize, Sequelize);


async function saveToDatabase(dataArray) {
    const promises = dataArray.map(async (data) => {
      let weight;
      if (data.char == "G") {
        weight = 5;
      } else if (data.char == "S") {
        weight = 4;
      } else if (data.char == "A") weight = 3;
      else {
        weight = 2;
      }
  
      return await account.create({
        twitterHandle: data.url,
        signalTier: weight,
      });
    });
  
    try {
      await Promise.all(promises);
      console.log("Data saved to database successfully.");
    } catch (error) {
      console.error("Error saving data to database:", error);
    }
  }
  
  async function saveAccountListFromCSV() {
    let dataArray = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const newData = {
          url: row["item"],
          char: row["weights"],
        };
        dataArray.push(newData);
      })
      .on("end", async () => {
        console.log(dataArray);
        await saveToDatabase(dataArray);
      });
  }

saveAccountListFromCSV()