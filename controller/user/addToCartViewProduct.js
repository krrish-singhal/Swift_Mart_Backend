const addToCartModel = require("../../models/addToCart");

const addToCartViewProduct=async(req,res)=>{
    try {
        const currentUser=req.userId;
        const allProduct=await addToCartModel.find({
            userId:currentUser
        }).populate("productId")
        res.json({
          data:allProduct,
          success:true,
          error:false,

        })
        
    } catch (err) {
        res.status(400).json({
            messsage:err.message|| err,
            succeess:false,
            error:true,

        })
        
    }

}

module.exports=addToCartViewProduct