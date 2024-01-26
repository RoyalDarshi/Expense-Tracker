const express=require("express");

const premiumController=require("../controller/premium");

const Router=express.Router();

Router.get("/leaderboard",premiumController.leaderboard);

Router.get("/download",premiumController.downloadExpense)

Router.get("/prevDownload",premiumController.prevDownloads)

module.exports=Router;