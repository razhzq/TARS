require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});
const account = require("../database/account.model")(sequelize, Sequelize);

class Account {
  constructor() {}

  static async saveAccount() {
    await account.create({
      twitterHandle: accountName,
      signalTier: tier,
    });
  }

  static async getAccountId(accountName) {
    const accountID = await account.findOne({
      where: { twitterHandle: accountName },
    });

    if (accountID) {
      return accountID.id;
    } else {
      return null;
    }
  }

  static async getAccountTier(accountName) {
    const accTier = await account.findOne({
      where: { twitterHandle: accountName },
    });
    if (accTier) {
      return accTier.signalTier;
    } else {
      return null;
    }
  }
}


module.exports = Account;
