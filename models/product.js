"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../database")


let Product = sequelize.define("product", {
    id : {
        type:           Sequelize.INTEGER,
        autoIncrement:  true,
        allowNull:      false,
        primaryKey:     true
    },
    name:   {
        type:           Sequelize.STRING,
        allowNull:      false
    },
    description:   {
        type:           Sequelize.STRING
    },
    price:   {  
        type:           Sequelize.FLOAT,
        allowNull:      false
    },
    menge : {
        type:           Sequelize.INTEGER,
        allowNull:      false,
    },
    image : {
        type :          Sequelize.STRING,
        allowNull:      false
    }
});

module.exports = Product;
