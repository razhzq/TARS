module.exports = (sequelize, DataTypes) => {
    const token = sequelize.define('token', {
        tokenName: DataTypes.STRING,
        tokenWeight: DataTypes.FLOAT
    })

    return token;
}