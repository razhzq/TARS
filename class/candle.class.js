require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const candle = require("../database/candle.model")(sequelize, Sequelize);

class Candle {
  constructor() {}

  static async newTokenCandle(tokenId, tokenWeight) {
    await candle.create({
      token: tokenId,
      tokenWeight: tokenWeight,
      checkpoint: new Date(),
    });
  }

  static async updateCandleStatus(candleId) {
    await candle.update({ dStatus: 0 }, { where: { id: candleId } });
  }

  static async getAllCandle() {
    const candles = await candle.findAll(
      {
        attributes: ["id", "token", "checkpoint", "increment"],
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
