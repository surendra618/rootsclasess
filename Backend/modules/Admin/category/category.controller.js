import { Category } from "./category.model.js";

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user?._id, 
    });

    res.status(201).json({ success: true, message: "Category added successfully", data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getCategoryRequests = async (req, res) => {
//   try {
//     const requests = await CategoryRequest.find().populate("instructor", "name email");
//     res.json({ success: true, data: requests });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const reviewCategoryRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { action } = req.body;

//     const request = await CategoryRequest.findById(requestId);
//     if (!request) return res.status(404).json({ success: false, message: "Request not found" });

//     request.status = action;
//     request.reviewedAt = new Date();
//     await request.save();

//     if (action === "approved") {
//       await Category.create({
//         name: request.requestedCategoryName,
//         description: request.description,
//         createdBy: req.user._id, 
//       });
//     }

//     res.json({ success: true, message: `Request ${action} successfully`, data: request });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const UpdateCategory = async (req, res, next) => {
  try {
    const { categoryId, description, name } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
        success: false,
        error: true,
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name || category.name,
        description: description || category.description,
      },
      { returnDocument: 'after' } 
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteCategory = async(req,res,next)=>{
    try {
        const {categoryId} = req.body;
        const deletedcategory = await Category.findByIdAndDelete(categoryId)
        return res.status(200).json({
            message:"deleted successfully",
            error:false,
            success:true,
            data:deletedcategory
        })
        
    } catch (error) {
        next(error)
    }
}

// export const requestNewCategory = async (req, res) => {
//   try {
//     const { requestedCategoryName, description } = req.body;

//     const existing = await Category.findOne({ name: requestedCategoryName });
//     if (existing) return res.status(400).json({ success: false, message: "Category already exists" });

//     const request = await CategoryRequest.create({
//       instructor: req.user._id,
//       requestedCategoryName,
//       description,
//     });

//     res.status(201).json({ success: true, message: "Category request submitted", data: request });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };