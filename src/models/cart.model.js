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
const cartSchema = Schema({
    userId: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    offer:{
        type:Number
    },
    products:[
        {
            productId:{
                ref:'product',
                type:Schema.Types.ObjectId
            },
            qty: {type:Number},
            cartItemCreatedAt:{ type: Date },
        }
    ],
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
      updatedAt: 'updatedAt'
    }
})

cartSchema.pre('save',async function(next){
    this.isDeleted= false,
    this.isActive= true
    next()
})

cartSchema.pre('insertMany',async function(next,docs){
    if (docs && docs.length){
        for (let index = 0; index < docs.length; index++) {
          const element = docs[index];
          element.isDeleted = false;
          element.isActive = true;
        }
      }
      next();
})

cartSchema.method('toJSON', function () {
    const {
      _id, __v, ...object 
    } = this.toObject({ virtuals:true });
    object.id = _id; 
    return object;
});

cartSchema.plugin(mongoosePaginate);
// productSchema.plugin(idValidator);
export const Cart = mongoose.model("Cart",cartSchema);