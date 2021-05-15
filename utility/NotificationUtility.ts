//email
//notifications

import { response } from "express"

//Otp
export const GenerateOtp =() =>{
    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime()+ (30*60*1000))
    return {otp, expiry}
}

export const onRequestOTP = async (otp: number, toPhoneNumber:string) =>{
    const accountSid = 'AC88c94d6e379ecc96f404d4cafeb41761';
    const authToken = '050964cf14a439a7079a0ff578f787bb';
    const client = require('twilio')(accountSid, authToken);

    const repons =await client.messages.create({
        body: `Your OTP is ${otp}`,
        from : '+15732734161', 
        to:`+216${toPhoneNumber}`,
    })

    return response;
}

//payment notification or emails