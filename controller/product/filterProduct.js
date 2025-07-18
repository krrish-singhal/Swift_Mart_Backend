const productModel = require("../../models/productModel");

const filterProductController=async(req,res)=>{
    try {
        const categoryList=req?.body?.category || []
        const product =await productModel.find({
            category:{
                "$in" : categoryList,
            }
        })
        res.json({
            data:product,
            message:"product",
            success:true,
            error:false,
        })
        
    } catch (err) {
        res.status(500).json({
            message: err.message || "Error",
            success: false,
            error: true,
        });
    }
}

module.exports=filterProductController