import Sequelize from "sequelize";

import sequelize from "../util/database";

const Order=sequelize.define("order",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    paymentId:{
        type:Sequelize.STRING
    },
    orderId:{
        type:Sequelize.STRING
    },
    status:{
        type:Sequelize.STRING
    }
});

export default Order;