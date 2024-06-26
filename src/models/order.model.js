import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseUniqueValidator from "mongoose-unique-validator";

const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
};
mongoosePaginate.paginate.options = {customLabels:myCustomLabels}

const orderSchema = Schema({
    userId:{
        ref:'user',
        type:Schema.Types.ObjectId
    },
    cartId:{
        ref:'cart',
        type:Schema.Types.ObjectId
    },
    products: [
        {
            productId:{
                ref: 'product',
                type: Schema.Types.ObjectId
            },
            qty:{
                type:Number
            },
            orderStatus:{
                orderConfirm:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                },
                shipped:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                },
                outForDelivery:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                },
                delivered:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                },
                cancel:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                },
                refunded:{
                    isConfirmed:{ type: Boolean, default: false },
                    date:{ type: Date }
                } 
            },
            orderCreatedAt:{
                type:Date
            }
        }
    ],
    status: { 
        type: String,
        enum: ['success','pending','cancel','failed','active'],
        default: 'pending'
    },
    address:{
        locality : {type:String},
        city : {type:String},
        state : {type:String},
        country : {type:String},
        zipcode : {type:Number}
    },
    paymentId: {
        ref: 'payment',
        type: Schema.Types.ObjectId
    },
    addedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    updatedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    isAppUser: { type: Boolean, default: true },
    isActive: { type: Boolean },
    isDeleted: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
},{
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      orderCreatedAt: 'orderCreatedAt'
    }
})

orderSchema.pre('save', async function (next) {
    this.isDeleted = false;
    this.isActive = true;
    next();
  });
  
orderSchema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length){
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
        element.isActive = true;
      }
    }
    next();
  });
  
  orderSchema.method('toJSON', function () {
    const {
      _id, __v, ...object 
    } = this.toObject({ virtuals:true });
    object.id = _id;
       
    return object;
  });
  orderSchema.plugin(mongoosePaginate);
  export const Order = mongoose.model('Order',orderSchema);