import express, {Request, Response , NextFunction} from 'express'
import { Vandor, FoodDoc } from '../models';


export const GetFoodAvailability = async (req: Request, res:Response , next: NextFunction) => {

    const result = await Vandor.find()
    .sort([['rating' , 'descending']])
    .populate("foods")
    console.log(result)

    if(result.length >0){
        return res.status(200).json(result)
    }
    return res.status(400).json({message: "Data Not found"})


}



export const GetTopRestaurants = async (req: Request, res:Response , next: NextFunction) => {
    const result = await Vandor.find()
    .sort([['rating' , 'descending']])
    .limit(10)

    if(result.length >0){
        return res.status(200).json(result)
    }
    return res.status(400).json({message: "Data Not found"})
}

export const GetFoodsIn30Min = async (req: Request, res:Response , next: NextFunction) => {
   
    const result = await Vandor.find()
    .populate("foods")

    if(result.length >0){
        let foodResult : any =[];
        result.map(vandor =>{
            const foods = vandor.foods as [FoodDoc]
            foodResult.push(...foods.filter(food => food.readyTime <= 30));
        })
        return res.status(200).json(foodResult)
    }
    return res.status(400).json({message: "Data Not found"})
}



export const SearchFoods = async (req: Request, res:Response , next: NextFunction) => {
  
    const result = await Vandor.find()
    .populate("foods")

    if(result.length >0){
        let foodResult : any =[];
        result.map(item => foodResult.push(...item.foods))

        return res.status(200).json(foodResult)
    }
    return res.status(400).json(result)
}



export const RestaurantById = async (req: Request, res:Response , next: NextFunction) => {
    const id = req.params.id;
    const result = await Vandor.findById(id).populate("foods")

    if(result){
        return res.status(200).json(result)
    }
    return res.status(400).json({message: "Data Not found"})
}