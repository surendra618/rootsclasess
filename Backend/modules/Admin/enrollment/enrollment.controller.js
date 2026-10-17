import { EnrollStudent } from "../../Student/enrollStudent/enrollStudent.model.js";
import { EnrollTest } from "../../Student/enrollStudent/enrollTest.model.js";

export const getAllPurchasedCourses = async (req, res) => {
  try {
    const purchases = await EnrollStudent.find()
      .populate("student", "fullName name email phone currentClass className address gender profileImage")
      .populate("course", "title price level instructor")
      .sort({ createdAt: -1 });

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

export const getAllPurchasedTests = async (req, res) => {
  try {
    const purchases = await EnrollTest.find()
      .populate("student", "fullName name email phone currentClass className address gender profileImage")
      .populate("test", "title price category difficulty duration totalMarks className year isPaid")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All purchased tests fetched",
      data: purchases
    });

  } catch (error) {
    console.error("Error fetching test purchases:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};