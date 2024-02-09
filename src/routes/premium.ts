import {Router} from "express";

import premiumController from "../controller/premium";

const premiumRouter=Router();

premiumRouter.get("/leaderboard",premiumController.leaderboard as any);

premiumRouter.get("/download",premiumController.downloadExpense as any)

premiumRouter.get("/prevDownload",premiumController.prevDownloads as any);

premiumRouter.post("/dailyReport",premiumController.dailyReport as any)

premiumRouter.post("/monthlyReport",premiumController.monthlyReport as any)
export default premiumRouter;