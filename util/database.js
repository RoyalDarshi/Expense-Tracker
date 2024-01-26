const { Sequelize }=require("sequelize");

const sequelize=new Sequelize(process.env.DATABASE_SCHEMA,
    process.env.DATABASE_USERNAME,process.env.DATABASE_PASSWORD,{
    dialect:"mysql",
    host:process.env.HOST_NAME
})

module.exports=sequelize;