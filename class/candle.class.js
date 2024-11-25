require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const candle = require("../database/candle.model")(sequelize, Sequelize);

class Candle {
  constructor() {}

  static async newTokenCandle(tokenId, tokenWeight, increment) {
    try {
      await candle.create({
        token: tokenId,
        tokenWeight: tokenWeight,
        checkpoint: new Date(),
        increment: increment,
        dStatus: 0
      });
    } catch (err)
    {
      console.log(`error newTokenCandle for token: ${tokenId}`);
    }
  }

  static async updateCandleStatus(candleId) {
    try {
      await candle.update({ dStatus: 1 }, { where: { id: candleId } });
    } catch (err)
    {
      console.log(`error updateCandleStatus: ${candleId}`);
    }
  
  }

  static async getAllCandle() {
    const candles = await candle.findAll(
      {
        attributes: ["id", "token", "checkpoint", "increment", "dStatus"],
      },
      { where: { dStatus: 1 } }
    );
    const formattedCandles = candles.map((candle) => ({
      token: candle.dataValues.token,
      checkpoint: candle.dataValues.checkpoint,
      increment: candle.dataValues.increment,
    }));
    return formattedCandles;
  }
}


module.exports = Candle;
