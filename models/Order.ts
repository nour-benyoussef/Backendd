import mongoose, {Schema,Document, Model} from 'mongoose';


export interface OrderDoc extends Document {
    orderID: string,
    vandorAdress: String,
    customerAdress:string,
    items: [any],
    totalAmount :number,
    orderDate : Date,
    paidThrough : string,
    orderStatus : string,
    readyTime: number
    affect:String
    state:Boolean
}

const OrderSchema = new Schema({
    orderID: { type : String, required: true},
    vandorAdress: { type : String},
    customerAdress: { type : String},
    items: [
        {
            food: {type: Schema.Types.ObjectId, ref:"food" , required: true},
            unit: {type: Number, required: true}
        }
    ],
    totalAmount :{type: Number, required: true},
    orderDate : {type: Date},
    paidThrough : { type : String},
    orderStatus : { type : String},
    readyTime: { type : Number},
    affect:{type:String,default:"Affect"},
    state:{type:Boolean,default:false}


},{
    toJSON:{
        transform(doc, ret){
            delete ret.__v,
            delete ret.createdAt, 
            delete ret.updatedAt 
        }
    },
    timestamps: true

})

const Order = mongoose.model<OrderDoc>('order',OrderSchema);

export {Order};