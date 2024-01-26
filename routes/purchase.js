const express=require("express");

const purchaseController=require("../controller/purchase")

const router=express.Router();

router.get("/purchase-premium",purchaseController.purchasePremium);

router.post("/update-payment-status",purchaseController.updatePaymentStatus);

router.post("/payment-failed",purchaseController.paymentFailed)

module.exports=router;