import mongoose, {Schema,Document, Model} from 'mongoose';


export interface OrderDoc extends Document {
    orderID: string,
    vandorId: String,
    items: [any],
    totalAmount :number,
    orderDate : Date,
    paidThrough : string,
    paymentResponse : string,
    orderStatus : string,
    ramarks:string,
    deliveryId: string,
    readyTime: number
}

const OrderSchema = new Schema({
    orderID: { type : String, required: true},
    vandorId: { type : String, required: true},
    items: [
        {
            food: {type: Schema.Types.ObjectId, ref:"food" , required: true},
            unit: {type: Number, required: true}
        }
    ],
    totalAmount :{type: Number, required: true},
    orderDate : {type: Date},
    paidThrough : { type : String},
    paymentResponse : { type : String},
    orderStatus : { type : String},
    ramarks:{ type : String},
    deliveryId: { type : String},
    readyTime: { type : Number}

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