require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const token = require("../database/token.model")(sequelize, Sequelize);

class Token {
  constructor() {}

  static async saveNewToken(tokenName) {
    await token.create({
      tokenName: tokenName,
      tokenWeight: 0,
    });
  }

  static async getTokenId(tokenName) {
    const tokenID = await token.findOne({ where: { tokenName: tokenName } });
    return tokenID.id;
  }
  static async getTokenName(tokenId) {
    const tokenName = await token.findOne({ where: { id: tokenId } });
    return tokenName.tokenName;
  }

  static async getAllTokens() {
    const allToken = await token.findAll();
    const formattedTokens = allToken.map((t) => ({
      tokenId: t.dataValues.id,
      tokenName: t.dataValues.tokenName,
      tokenWeight: t.dataValues.tokenWeight,
      network: t.dataValues.network,
      link: t.dataValues.link
    }));
    return formattedTokens;
  }

  static async checkTokenIfExist(tokenName) {
    const tokenCheck = await token.findOne({ where: { tokenName: tokenName } });
    return !!tokenCheck;
  }

  static async increaseTokenWeight(tokenId, additionalWeight) {
    const currToken = await token.findOne({ where: { id: tokenId } });
    const newTokenWeight = currToken.tokenWeight + additionalWeight;
    await token.update(
      { tokenWeight: newTokenWeight },
      { where: { id: tokenId } }
    );
    return newTokenWeight;
  }

  static async decreaseTokenWeight(tokenId, decrementWeight) {
    const currToken = await token.findOne({ where: { id: tokenId } });
    const newTokenWeight = currToken.tokenWeight - decrementWeight;
    await token.update(
      { tokenWeight: newTokenWeight },
      { where: { id: tokenId } }
    );
    return newTokenWeight;
  }
}


module.exports = Token;