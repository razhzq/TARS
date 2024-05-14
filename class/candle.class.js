require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});
const candle = require("../database/candle.model")(sequelize, Sequelize);

class Candle {
  constructor() {}

  static async newTokenCandle(tokenId, tokenWeight, increment) {
    await candle.create({
      token: tokenId,
      tokenWeight: tokenWeight,
      checkpoint: new Date(),
      increment: increment,
      dStatus: 0
    });
  }

  static async updateCandleStatus(candleId) {
    await candle.update({ dStatus: 1 }, { where: { id: candleId } });
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
