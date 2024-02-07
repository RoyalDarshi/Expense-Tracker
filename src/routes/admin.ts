import {Router} from "express";

import adminController from "../controller/admin";

const adminRouter=Router();

adminRouter.get("/",adminController.sendFile);

adminRouter.post("/user-signup",adminController.createUser as any);

adminRouter.post("/user-login",adminController.loginUser as any);

adminRouter.post("/forgot-password",adminController.forgotPassword as any)

adminRouter.get("/reset-password/:resetToken",adminController.getResetPassword as any)

adminRouter.post("/reset-password",adminController.postResetPassword as any)

adminRouter.get("/find-user",adminController.isPremiumUser as any);

adminRouter.post("/create-expense",adminController.createExpense as any);

adminRouter.get("/weekly-expense",adminController.weeklyExpense as any)

adminRouter.get("/get-expenses/:userId",adminController.getAllExpenses as any);

adminRouter.post("/delete-expense/:id",adminController.deleteExpense as any);

export default adminRouter;