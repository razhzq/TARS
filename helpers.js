require("dotenv").config();


const Account = require("./class/account.class");

module.exports.getAccountMap = async () => {
  const accountMap = new Map();
  const accountArray = await Account.getAccountTable();
  accountArray.forEach((account) => {
    accountMap.set(account.twitterHandle, {
      id: account.id,
      signalTier: account.signalTier,
    });
  });
  return accountMap;
  
};


