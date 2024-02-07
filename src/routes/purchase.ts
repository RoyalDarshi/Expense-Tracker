import {Router} from "express";

import purchaseController from "../controller/purchase";

const purchaseRouter=Router();

purchaseRouter.get("/purchase-premium",purchaseController.purchasePremium  as any);

purchaseRouter.post("/update-payment-status",purchaseController.updatePaymentStatus as any);

purchaseRouter.post("/payment-failed",purchaseController.paymentFailed as any)

export default purchaseRouter;