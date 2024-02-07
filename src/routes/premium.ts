import {Router} from "express";

import premiumController from "../controller/premium";

const premiumRouter=Router();

premiumRouter.get("/leaderboard",premiumController.leaderboard as any);

premiumRouter.get("/download",premiumController.downloadExpense as any)

premiumRouter.get("/prevDownload",premiumController.prevDownloads as any)

export default premiumRouter;