import express, {Request, Response , NextFunction} from 'express'
import { GetFoodAvailability, GetFoodsIn30Min, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();
//Food Availability
router.get('/',GetFoodAvailability)

//Top Restaurants
router.get('/top-restaurants/',GetTopRestaurants)
//Foods Available in 30 minutes
router.get('/foods-in-30-min/',GetFoodsIn30Min)
//Search Foods
router.get('/search',SearchFoods)
//Find Restaurant by Id
router.get('/restaurant/:id',RestaurantById)

export {router as ShoppingRoute}