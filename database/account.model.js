module.exports = (sequelize, DataTypes) => {
    const account = sequelize.define('account', {
        twitterHandle: DataTypes.STRING,
        signalTier: DataTypes.INTEGER
    })

    return account;
}