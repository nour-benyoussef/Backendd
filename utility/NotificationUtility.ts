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
    const accountSid = 'AC00bbd34eeae416c3c2d78a547a3ab93a';
    const authToken = '5ed972308dc18854c92973b99a696648';
    const client = require('twilio')(accountSid, authToken);

    const repons =await client.messages.create({
        body: `Your OTP is ${otp}`,
        from : '+18643652110', 
        to:`+216${toPhoneNumber}`,
    })

    return response;
}

//payment notification or emails