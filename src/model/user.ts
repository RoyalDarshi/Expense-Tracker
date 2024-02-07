import Sequelize from "sequelize";

import sequelize from "../util/database";

const User=sequelize.define("user",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull: false
    },
    email:{
        type:Sequelize.STRING,
        allowNull: false,
        unique:true
    },
    password:{
        type:Sequelize.STRING,
        allowNull: false
    },
    isPremiumUser:Sequelize.BOOLEAN,
    totalExpense:Sequelize.INTEGER
});

export default User