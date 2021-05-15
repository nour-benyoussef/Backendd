import express, {Request, Response, NextFunction} from 'express';
import { CreateVandor, GetVandors, GetVandorsByID } from '../controllers';


const router = express.Router();
router.post('/vandor',CreateVandor);
router.get('/vandors',GetVandors)
router.get('/vandor/:id',GetVandorsByID)


router.get('/' ,(req: Request, res: Response, next:NextFunction)=>{
    res.json({message: "Hello from Admin"})
})


export {router as AdminRoute}
