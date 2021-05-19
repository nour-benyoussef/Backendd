import express, {Request, Response, NextFunction} from 'express';
import { AddToCart, CreateOrder, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrders, GetOrdersById, RequestOtp } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();


//sign up
router.post('/signup', CustomerSignUp)
//login 
router.post('/login', CustomerLogin)

router.use(Authenticate)
//Verify Customer Account
router.patch('/verify', CustomerVerify) 
//OTP
router.get('/otp', RequestOtp)
//Profile
router.get('/profile', GetCustomerProfile)
router.patch('/profile', EditCustomerProfile)

//Cart
router.post('/cart', AddToCart);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);
//payment

//order
router.post('/createorder',CreateOrder);
router.get('/orders',GetOrders);
router.get('/order/:id',GetOrdersById)


export {router as CustomerRoute}