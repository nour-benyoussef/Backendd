import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import express, {Request, Response, NextFunction} from 'express';
import {CreateCustomerInputs,UserLoginInputs, EditCustomerProfileInputs, OrderInputs} from '../dto'
import { Customer, Food } from '../models';
import { Order } from '../models/Order';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP, ValidatePassword } from '../utility';


export const CustomerSignUp = async (req: Request, res: Response, next:NextFunction) =>{

    const customerInputs = plainToClass(CreateCustomerInputs, req.body)
    const inputsErrors = await validate(customerInputs, {validationError: {target: true}});

    if(inputsErrors.length>0){
        return res.status(400).json(inputsErrors);
    }

    const {email, phone , password, address} = customerInputs;

    const salt= await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt)
    const {otp, expiry}=GenerateOtp();

    const existCustomer = await Customer.findOne({email : email})

    if(existCustomer !== null){
        return res.status(409).json({message: ' An user exist with the provided email ID'})
    }
   

    const result = await Customer.create({
        email:email,
        password: userPassword,
        salt:salt,
        phone:phone,
        otp:otp,
        otp_expiry: expiry,
        firstName:'',
        lastName:'',
        address: address,
        verified: false,
        lat:0,
        lng:0, 
        orders: []
    })

    if (result){

        await onRequestOTP(otp, phone)

        const token = GenerateSignature({
            _id: result.id,
            email: result.email,
            verified: result.verified
        })

        return res.status(201).json({ token: token, verified: result.verified, email: result.email});

    }

return res.status(400).json ({message : 'Error with Signup'})

}











export const CustomerLogin = async (req: Request, res: Response, next:NextFunction) =>{
    const loginInputs = plainToClass (UserLoginInputs, req.body);
    const loginErrors = await validate(loginInputs, {validationError: {target : false}})

    if (loginErrors.length > 0){
        return res.status(400).json(loginErrors)
    }
    const {email, password} = loginInputs
    const customer = await Customer.findOne({ email:email})

    if(customer){
        const validation = await ValidatePassword(password, customer.password, customer.salt);

        if (validation){
            const token = GenerateSignature({
                _id: customer.id,
                email: customer.email,
                verified: customer.verified
            })
    
            return res.status(201).json({ token: token, 
                verified: customer.verified, 
                email: customer.email});
        }

    }
        return res.status(404).json ({message : 'Login Error'})

    
}




















export const CustomerVerify = async (req: Request, res: Response, next:NextFunction) =>{
    const {otp} = req.body;
    const customer = req.user;
   
    if (customer){

        const profile = await Customer.findById(customer._id)
        if (profile){
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;
                const updateCustomerResponse = await profile.save();

                const token = GenerateSignature({
                    _id: updateCustomerResponse.id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified
                })
                return res.status(201).json({ token: token,
                     verified: updateCustomerResponse.verified,
                      email: updateCustomerResponse.email});

            }



        }
    }
    return res.status(400).json ({message : 'Error with OTP Validation'})


}









export const RequestOtp = async (req: Request, res: Response, next:NextFunction) =>{
    const customer = req.user;

    if (customer){

        const profile = await Customer.findById(customer._id)

        if(profile){
            const { otp, expiry} = GenerateOtp();

            profile.otp=otp;
            profile.otp_expiry = expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            res.status(200).json({message:'OTP sent your registred phone number!'})

        }
    }
    return res.status(400).json ({message : 'Error with Request OTP'})

}









export const GetCustomerProfile = async (req: Request, res: Response, next:NextFunction) =>{
   
    const customer = req.user;
    

    if (customer){

        const profile = await Customer.findById(customer._id)

        if(profile){

           return res.status(200).json(profile)

        }
    }
    return res.status(400).json ({message : 'Error with Fetch Profile! '})
   

}













export const EditCustomerProfile = async (req: Request, res: Response, next:NextFunction) =>{
    const customer = req.user;
    const profileInputs = plainToClass( EditCustomerProfileInputs, req.body);
    
    const profileErrors = await validate(profileInputs, {validationError: {target:false}})
    if(profileErrors.length >0){
        return res.status(400).json(profileErrors);
    }

    const {firstName, lastName, address}= profileInputs;

    if (customer){

        const profile = await Customer.findById(customer._id)

        if(profile){

            profile.firstName=firstName;
            profile.lastName=lastName;
            profile.address=address

            const result = await profile.save();


            res.status(200).json(result)

        }
    }
}

//cart
export const AddToCart = async (req:Request, res:Response, next:NextFunction) =>{

    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();
        const {_id, unit} = <OrderInputs>req.body;

        const food = await Food.findById(_id);

        if(food){
            if(profile != null){
                cartItems = profile.cart;
                if(cartItems.length > 0){
                    let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);
                    if(existFoodItem.length > 0){
                        const index = cartItems.indexOf(existFoodItem[0]);
                        if(unit > 0){
                            cartItems[index] ={food, unit}
                        }else{
                            cartItems.splice(index, 1);
                        }

                    }else{
                         cartItems.push ({food,unit});
                    }

                }else{
                    cartItems.push ({food,unit});
                }
                if (cartItems){
                    profile.cart = cartItems as any;
                    const cartresult = await profile.save();
                    return res.status(200).json(cartresult.cart)
                }

            }

        }
 


    }
        return res.status(400).json ({message : 'Unable to Create Cart ! '})

}



export const GetCart = async (req:Request, res:Response, next:NextFunction) =>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if(profile){
            return res.status(200).json(profile.cart);
        }
    }
    return res.status(400).json ({message : 'Cart is Empty ! '})

}



export const DeleteCart = async (req:Request, res:Response, next:NextFunction) =>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if(profile != null){
            profile.cart = [] as any;
            const cartResult = await profile.save();
            return res.status(200).json(cartResult);
        }
    }
    return res.status(400).json ({message : 'Cart is already Empty ! '})
}











//order
export const CreateOrder = async (req: Request, res: Response, next:NextFunction) =>{

    const customer = req.user;
    if(customer){

        const profile = await Customer.findById(customer._id);

        const orderId=`${Math.floor(Math.random()* 89999) + 1000}`;
        var cart  = <[OrderInputs]>req.body.cart;
        let cartItems = Array();
        let netAmount = 0.0;
        let VandorAdress;

       
  
    

        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();
        foods.map(food => {
            cart.map(({_id,unit})=>{
                if(food._id == _id){
                    VandorAdress = food.vandorAdress;
                    netAmount = netAmount+(food.price * unit);
                    cartItems.push({food,unit:unit})
                }
            })
        })

        if (profile){

        if(cartItems){
            const currentOrder = await Order.create({
                orderID: orderId,
                vandorAdress:VandorAdress,
                customerAdress:profile.address,
                items: cartItems,
                totalAmount: netAmount,
                orderDate : new Date(),
                paidThrough: 'COD',
                orderStatus: 'Waiting',
                readyTime:45,
            })

           
        
               
                profile.cart = [] as any 
                profile.orders.push(currentOrder);
                const profileSaveResponse = await profile.save();
                 return res.status(200).json(profileSaveResponse);

                }
            


        }else{
            return res.status(400).json ({message : 'Error with Create Order ! '})
        }

    }


}
export const GetOrders = async (req: Request, res: Response, next:NextFunction) =>{

    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate("orders");
         if(profile){
             return res.status(200).json(profile.orders);
         }

    }

}


export const GetOrdersById = async (req: Request, res: Response, next:NextFunction) =>{

    const orderId = req.params.id;

    if(orderId){
        const order = await Order.findById(orderId).populate('items.food');
        res.status(200).json(order);
    }

}



