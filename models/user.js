const Sequelize = require("sequelize");
const sequelize = require("../database")


// Model definieren
// Klasse dient als Grundlage für Erzeugung/Arbeit mit Datenbank-Tabelle
let User = sequelize.define("user", {
    id : {
        type:           Sequelize.INTEGER,
        autoIncrement:  true,
        allowNull:      false,
        primaryKey:     true
    },
    username:   {
        type:      Sequelize.STRING,
        allowNull:  false
    },
    password:   {
        type:   Sequelize.INTEGER,
        allowNull:  false
    }
});

module.exports = User;