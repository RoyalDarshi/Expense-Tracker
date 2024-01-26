const jwt=require("jsonwebtoken");
const AWS=require("aws-sdk");

const Expense=require("../model/expense");
const User=require("../model/user");
const FileUrl=require("../model/fileUrl")

module.exports.leaderboard=async (req,res)=>{
    const user=await User.findAll({
        attributes:["name","totalExpense"],
        order:[["totalExpense","DESC"]]
        }
    ).catch(err=>{
        console.log(err)
    })
    res.status(201).json(user);
}

module.exports.downloadExpense=async (req,res)=>{
    const userId=jwt.decode(req.headers.authorization);
    const expenses=await Expense.findAll({where:{userId:userId}})
    const stringifyExpense=JSON.stringify(expenses);
    const fileName=`Expense${userId}/${new Date()}.txt`;
    const fileUrl=await uploadToS3(fileName,stringifyExpense)
    await FileUrl.create({url:fileUrl,name:fileName,userId:userId})
    res.status(201).json({url: fileUrl,success:true});
}
function uploadToS3(fileName,data){
    const BUCKET_NAME=process.env.BUCKET_NAME;
    const USER_KEY=process.env.IAM_USER_KEY;
    const USER_SECRET_KEY=process.env.IAM_USER_SECRET_KEY;
    const s3Bucket=new AWS.S3({
        accessKeyId:USER_KEY,
        secretAccessKey:USER_SECRET_KEY,
    })
        const params={
            Bucket:BUCKET_NAME,
            Key:fileName,
            Body:data,
            ACL:"public-read"
        }
        return new Promise((resolve,reject)=>{
            s3Bucket.upload(params,(err, data)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data.Location)
                }
            })
        })
}

module.exports.prevDownloads=async (req,res)=>{
    const userId=jwt.decode(req.headers.authorization)
    await FileUrl.findAll({where:{userId:userId}}).then(data=>{
        res.status(201).json(data);
    })

}