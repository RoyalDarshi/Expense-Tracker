import {Sequelize} from "sequelize";

const Db=new Sequelize(process.env.DATABASE_SCHEMA!,
    process.env.DATABASE_USERNAME!,process.env.DATABASE_PASSWORD,{
    dialect:"mysql",
    host:process.env.HOST_NAME
})

export default Db;