import {Request, Response, NextFunction} from 'express'
import { CreateFoodInputs, EditVandorInputs, VandorLoginInputs } from '../dto';
import { Food } from '../models';
import { Order } from '../models/Order';

import { GenerateSignature, ValidatePassword } from '../utility';
import { FindVandor } from './AdminController';


export const VandorLogin = async (req:Request, res:Response,ext:NextFunction) => {

    const {email, password} = <VandorLoginInputs>req.body;

    const existingVandor = await FindVandor('',email);

    if(existingVandor !== null){
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);

        if(validation){

            const signature = GenerateSignature ({
                _id:existingVandor.id,
                email:existingVandor.email,
                foodTypes: existingVandor.foodType,
                name: existingVandor.name
            })
            return res.json(signature);

        }else{
              return res.json({"message": "Password not valid"})
       }
    

    }

    return res.json({"message": "login credential not valid"})
}


export const GetVandorProfile = async(req:Request, res:Response,next :NextFunction) => {
    const user = req.user;
    if (user){
        const existingVandor = await FindVandor(user._id)
        return res.json(existingVandor)
    }
    return res.json({"message": "Vandor information not Found"})

}



export const UpdateVandorProfile = async(req:Request, res:Response,next :NextFunction) => {

    const { foodTypes,name,address,phone} =<EditVandorInputs>req.body;
    const user = req.user;
    if (user){
        const existingVandor = await FindVandor(user._id)

        if(existingVandor !== null){
            existingVandor.name = name;
            existingVandor.address=address;
            existingVandor.phone=phone;
            existingVandor.foodType= foodTypes;

            const savedResult = await existingVandor.save()
            return res.json(savedResult)
        }
        return res.json(existingVandor)
    }
    return res.json({"message": "Vandor information not Found"})
    
}


export const UpdateVandorService = async(req:Request, res:Response,next :NextFunction) => {
    const user = req.user;
    if (user){
        const existingVandor = await FindVandor(user._id)

        if(existingVandor !== null){
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
            const savedResult = await existingVandor.save()
            return res.json(savedResult);

        }
        return res.json(existingVandor)
    }
    return res.json({"message": "Vandor information not Found"})
    
}



export const AddFood = async(req:Request, res:Response,next :NextFunction) => {
    const user = req.user;
    if (user){

        const {name,description,category,foodType,readyTime,price, images} = <CreateFoodInputs>req.body;
        const vandor = await FindVandor(user._id)
 
        if (vandor !== null){

       

            const createdFood= await Food.create({
                vandorId: vandor._id,
                vandorAdress: vandor.address,
                name:name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating:0
            })
            vandor.foods.push(createdFood);
            const result = await vandor.save();

            return res.json(result);
        }


    }
    return res.json({"message": "Something went wrong with add food"})
    
}



export const GetFoods = async(req:Request, res:Response,next :NextFunction) => {
    const user = req.user;
    if (user){

        const foods = await Food.find ({ vandorId: user._id})

        if (foods !== null){
            return res.json(foods)
        }

    }
    return res.json({"message": "Food information not Found"})
    
}


export const GetCurrentOrders = async(req:Request, res:Response,next :NextFunction) => {

    const user=req.user;
    if(user){
        const orders = await Order.find({ vandorId: user._id}).populate('items.food');
        if(orders != null){
            return res.status(200).json(orders);
        }

    }
    return res.json({"message": "Order not found"})




}

export const GetOrderDetails = async(req:Request, res:Response,next :NextFunction) => {
    const orderId = req.params.id;
    if(orderId){
        const order = await Order.findById(orderId).populate('items.food');
        if(order != null){
            return res.status(200).json(order);
        }

    }
    return res.json({"message": "Order not found"})

}


