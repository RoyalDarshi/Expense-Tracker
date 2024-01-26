const Sequelize=require("sequelize");

const sequelize = require("../util/database");

const Order=sequelize.define("forgotPasswordRequest",{
    id:{
        type:Sequelize.STRING,
        allowNull:false,
        primaryKey:true
    },
    isActive:{
        type:Sequelize.BOOLEAN
    }
});

module.exports=Order;