const Sequelize=require("sequelize");

const sequelize = require("../util/database");

const Order=sequelize.define("fileUrl",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:Sequelize.STRING
    },
    url:{
        type:Sequelize.STRING
    }
});

module.exports=Order;