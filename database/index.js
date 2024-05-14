require('dotenv').config();
const {Sequelize} = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.token = require('./token.model')(sequelize, Sequelize);
db.account = require('./account.model')(sequelize, Sequelize);
db.mention = require('./mention.model')(sequelize, Sequelize);
db.tweet = require('./tweet.model')(sequelize, Sequelize);
db.candle = require('./candle.model')(sequelize, Sequelize);



module.exports = db;