const mongoose = require("mongoose")

const categoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        public_id: {
          type: String,
          required : true
        },
        url: {
          type: String,
          required: true
        }
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
});

const Categories = mongoose.model("Categories", categoriesSchema)

const getcategoriess = async function () {
    const result = await Categories.find({})
    return {code: 200, result: result}
}


const deleteCategories = async function (_id) {
  if(_id){
    console.log(_id)
  }
    try {
      // Validate ID (optional but recommended)
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return {code:200, result :'Invalid category ID'}

      }
  
      const deletedCategory = await Categories.findByIdAndDelete(_id);
  
      if (!deletedCategory) {
        return {code:400, result: "Category not found"}
      }
  
      // Handle dependent documents (optional)
      // If your categories have dependent documents (e.g., products), 
      // you might need additional logic here to handle them before deletion.
  
      return {code:200, message: 'Category deleted successfully'}
     

    } catch (error) {
      console.error(error);
      return {code:500 , message : 'Error deleting category'}
       
    }
  };
  


const createcategoriess = async function (req, cloudinaryResponseForCategory) {
    try {
        let categories = new Categories({
            name: req.body.name,
            image: {
              public_id: cloudinaryResponseForCategory.public_id,
              url: cloudinaryResponseForCategory.secure_url
            }
        }); 
        const response = await categories.save()
        return {code: 200, result: response}
    } catch (error) {
        return {code: 400, result: error}
    }
}

module.exports.createcategories = createcategoriess
module.exports.getcategoriess = getcategoriess 
module.exports.deleteCategories= deleteCategories
module.exports.Categories = Categories