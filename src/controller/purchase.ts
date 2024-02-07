import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

import User from "../model/user";
import Order from "../model/order";
import sequelize from "../util/database";
import { Model } from "sequelize";

const purchasePremium = (req: { headers: { authorization: string; }; }, res: {
    status: (arg0: number) => {
        (): any;
        new(): any;
        json: { (arg0: { id: string; key_id: string | undefined; }): any; new(): any; };
    };
}) => {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    const amount = process.env.PURCHASE_AMOUNT!;
    const userId = jwt.decode(req.headers.authorization)
    razorpay.orders.create({amount, currency: "INR"}, (err, data) => {
        if (err) {
            throw new Error(JSON.stringify(err));
        }
        Order.create({orderId: data.id, status: "PENDING", userId: userId}).then(() => {
            return res.status(201).json({id: data.id, key_id: process.env.RAZORPAY_KEY_ID});
        })
    })
}

const updatePaymentStatus = async (req: {
    body: { orderId: any; paymentId: any; };
    headers: { authorization: string; };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: [affectedCount: number, affectedRows: Model<any, any>[]]): void; new(): any; }; }; })=>{
    const orderId=req.body.orderId;
    const paymentId=req.body.paymentId;
    const userId=jwt.decode(req.headers.authorization);
    const trans=await sequelize.transaction();
    // @ts-ignore
    await Order.update({status:"SUCCESS",paymentId: paymentId},{where:{orderId:orderId}},{transaction:trans}).then(async ()=>{
        // @ts-ignore
        await User.update({isPremiumUser:true},{where:{id:userId}},{transaction:trans}).then(async (data)=>{
            await trans.commit();
            res.status(201).json(data)
        })
    }).catch(async (err)=>{
        await trans.rollback();
        console.log(err)
    })

};

const paymentFailed=async (req: { body: { orderId: any; status: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { msg: string; }): void; new(): any; }; }; })=>{
    const orderId=req.body.orderId;
    const status=req.body.status;
    await Order.update({status:status},{where:{orderId:orderId}}).catch(err=>{
        console.log(err)
    })
    res.status(201).json({msg:"Payment Failed"})
}

const purchaseController={
    purchasePremium,
    paymentFailed,
    updatePaymentStatus
}
export default purchaseController;