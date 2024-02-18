module.exports = (sequelize, DataTypes) => {
    const tweet = sequelize.define('tweet', {
        tweetString: DataTypes.TEXT,
        tweetWho: DataTypes.STRING,
        tweetTime: DataTypes.DATE,
        tweetToken: DataTypes.STRING
    })

    return tweet;
}