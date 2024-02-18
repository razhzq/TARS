module.exports = (sequelize, DataTypes) => {
    const mention = sequelize.define('mention', {
        tokenMention: DataTypes.INTEGER,
        accountMention: DataTypes.INTEGER,
    })

    return mention
}