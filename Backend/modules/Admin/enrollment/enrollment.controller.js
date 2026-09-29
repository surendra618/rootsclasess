import { EnrollStudent } from "../../Student/enrollStudent/enrollStudent.model.js";

export const getAllPurchasedCourses = async (req, res) => {
  try {
    const purchases = await EnrollStudent.find()
      .populate("student", "fullName email")
      .populate("course", "title price");

    res.status(200).json({
      success: true,
      message: "All purchased courses fetched",
      data: purchases
    });

  } catch (error) {
    console.error("Error fetching purchases:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};