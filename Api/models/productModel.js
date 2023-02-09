const { DataTypes } = require('sequelize');
const {User,sequelize} = require('../models/model.js')

const Product = sequelize.define("product", {
    owner_user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SKU: {
        type: DataTypes.STRING,
        allowNull: false
    },
    manufacturer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Quantity:{
        type: DataTypes.INTEGER,
        allowNull:false
    }
}, {
    timestamps: true
});

module.exports =Product