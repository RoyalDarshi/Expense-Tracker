const path=require("path");
const rootDir =require("../util/path");

module.exports.pageNotFound=(req,res,next)=>{
    res.sendFile(path.join(rootDir,"view","pageNotFound.html"))
}