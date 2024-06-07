require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const tweet = require("../database/tweet.model")(sequelize, Sequelize);

class Tweet {
  constructor() {}

  static async saveNewTweet(string, account, time, token) {

   // validate parameter (if one of arguments is undefined)


    try {
      await tweet.create({
        tweetString: string,
        tweetWho: account,
        tweetTime: time,
        tweetToken: token,
      });
    } catch (err)
    {
      console.log(`error saveNewTweet for token: ${token}`)
    }
  }

  static async getTweets() {
    const tweets = await tweet.findAll({
      attributes: ["tweetString", "tweetWho", "tweetTime", "tweetToken"],
    });
    const formattedTweets = tweets.map((tweetInstance) => ({
      tweetString: tweetInstance.dataValues.tweetString,
      tweetWho: tweetInstance.dataValues.tweetWho,
      tweetTime: tweetInstance.dataValues.tweetTime,
      tweetToken: tweetInstance.dataValues.tweetToken,
    }));
    return formattedTweets;
  }

  static async getTweetsByToken(req, res) {
    const { token } = req.body;

    try {
      const tweets = await tweet.findAll({
        attributes: ["tweetString", "tweetWho", "tweetTime", "tweetToken"],
        where: { tweetToken: token }, // Moved where clause inside the findAll method
      });

      const formattedTweets = tweets.map((tweetInstance) => ({
        tweetString: tweetInstance.dataValues.tweetString,
        tweetWho: tweetInstance.dataValues.tweetWho,
        tweetTime: tweetInstance.dataValues.tweetTime,
        tweetToken: tweetInstance.dataValues.tweetToken,
      }));

      res.status(200).json(formattedTweets);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Tweet;