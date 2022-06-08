
const Sequelize = require("sequelize");

const sequelize = new Sequelize('mydatabase', 'root', '', {
    host: 'localhost',
    dialect:'mysql' 
  }); 

  module.exports = sequelize;