module.exports = (sequelize, DataTypes) => {
    const token = sequelize.define('token', {
        tokenName: DataTypes.STRING,
        tokenWeight: DataTypes.FLOAT,
        network: DataTypes.STRING,
        link: DataTypes.TEXT
    })

    return token;
}