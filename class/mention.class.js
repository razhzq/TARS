require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const mention = require("../database/mention.model")(sequelize, Sequelize);

class Mention {
  constructor() {}

  static async saveTokenMention(tokenId, accountId) {
    await mention.create({
      tokenMention: tokenId,
      accountMention: accountId,
    });
  }

  static async getAllMention() {
    const allMention = await mention.findAll();
    const formattedMentions = allMention.map((m) => ({
      tokenId: m.dataValues.tokenMention,
      accountId: m.dataValues.accountMention,
    }));
    return formattedMentions;
  }

  static async checkTokenMention(tokenId, account) {
    const mentionCheck = await mention.findOne({
      where: { tokenMention: tokenId, accountMention: account },
    });
    return !!mentionCheck;
  }
}


module.exports = Mention;
