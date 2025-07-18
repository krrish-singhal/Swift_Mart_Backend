const mongoose=require("mongoose");


const productSchema= mongoose.Schema({
    productName:String,
    brandName:String,
    category:String,
    
    isMysteryBox: {
        type: Boolean,
        default: false
    },
    
    productImage:[],
    description:String,
    price:Number,
    sellingPrice:Number,

},{
    timestamps:true
})


const productModel=mongoose.model("product",productSchema)

module.exports=productModel