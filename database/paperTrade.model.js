module.exports = (sequelize, DataTypes) => {
    const paper_trade = sequelize.define('paper_trade', {
        tokenName: DataTypes.STRING,
        boughtPriceSol: DataTypes.FLOAT,
        exitPriceSol: DataTypes.FLOAT,
        tokenAmount: DataTypes.FLOAT,
        link: DataTypes.TEXT,
    })

    return paper_trade;
}