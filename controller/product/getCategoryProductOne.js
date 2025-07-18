const productModel = require("../../models/productModel")

const getProductByCategory= async(req,res)=>{
    try {
        const productCategory=await productModel.distinct("category")
        const productByCategory=[]

        for (const category of productCategory) {
            const product=await productModel.findOne({category})
            if(product){
                productByCategory.push(product)
            }

            
        }
        res.json({
            message:"category product",
            success:true,
            error:false,
            data:productByCategory
        })
    
    } catch (err) {
        res.status(400).json({
            message:err.message|| err,
            success:false,
            error:true,
        })
        
    }

}

module.exports=getProductByCategory