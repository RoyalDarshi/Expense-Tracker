import Sequelize from "sequelize";

import sequelize from "../util/database";

const ForgotPassword=sequelize.define("forgotPasswordRequest",{
    id:{
        type:Sequelize.STRING,
        allowNull:false,
        primaryKey:true
    },
    isActive:{
        type:Sequelize.BOOLEAN
    }
});

export default ForgotPassword;