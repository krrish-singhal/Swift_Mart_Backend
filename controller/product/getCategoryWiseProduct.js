const productModel = require("../../models/productModel")

const getCategoryWiseProduct=async(req,res)=>{
    try {
        const {category}=req.body
        const product=await productModel.find({category})

        res.json({
            message:"product",
            data:product,
            error:false,
            success:true,



        })
        
    } catch (err) {
        res.status(400).json({
            message:err.message|| err,
            success:false,
            error:true,
        
    })
    }
}

module.exports=getCategoryWiseProduct