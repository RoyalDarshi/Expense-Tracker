import Sequelize from "sequelize";

import sequelize from "../util/database";

const FileUrl=sequelize.define("fileUrl",{
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

export default FileUrl;