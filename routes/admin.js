const express=require("express");

const adminController=require("../controller/admin");

const router=express.Router();

router.get("/",adminController.sendFile);

router.post("/user-signup",adminController.createUser);

router.post("/user-login",adminController.loginUser);

router.post("/forgot-password",adminController.forgotPassword)

router.get("/reset-password/:resetToken",adminController.getResetPassword)

router.post("/reset-password",adminController.postResetPassword)

router.get("/find-user",adminController.isPremiumUser);

router.post("/create-expense",adminController.createExpense);

router.get("/weekly-expense",adminController.weeklyExpense)

router.get("/get-expenses/:userId",adminController.getAllExpenses);

router.post("/delete-expense/:id",adminController.deleteExpense);

module.exports=router;