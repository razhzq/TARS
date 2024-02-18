module.exports = (sequelize, DataTypes) => {
    const candle = sequelize.define('candle', {
        token: DataTypes.INTEGER,  // tokenId
        tokenWeight: DataTypes.FLOAT,
        checkpoint: DataTypes.DATE,
        increment: DataTypes.FLOAT,
        dStatus: DataTypes.INTEGER  // status of candle if it has been decreased 
    })

    return candle;
}