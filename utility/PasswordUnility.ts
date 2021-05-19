import {Request, Response,NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthPayload, VandorPayload } from "../dto";
import { APP_SECRET } from "../config";



export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}


export const GeneratePassword = async (password: string, salt:string) => {
    return await bcrypt.hash(password,salt); 

}

export const ValidatePassword = async (enteredPassword: string, savedPassword:string, salt:string) => {
    return await GeneratePassword(enteredPassword, salt) === savedPassword;
}

export const GenerateSignature = (payload : AuthPayload) => {
    return jwt.sign(payload,APP_SECRET, {expiresIn:'1d'})
}


export const ValidateSignature = async(req : Request) => {

    const token = req.get('Authorization')
    if(token){
        const payload = await jwt.verify(token.split(' ')[1], APP_SECRET) as AuthPayload;
        req.user = payload;
        return true

    }

    return false
}