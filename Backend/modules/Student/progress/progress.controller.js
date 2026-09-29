import { Progress } from "./progress.model.js";
import { Course } from "../../instructor/createCourse/createCourse.model.js";

export const markTopicComplete = async (req, res) => {
  try {
    const { studentId, courseId, topicId } = req.body;


    if (!studentId || !courseId || !topicId) {
      return res.status(400).json({
        success: false,
        message: "studentId, courseId and topicId are required",
      });
    }

    let progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      progress = new Progress({
        studentId,
        courseId,
        completedTopics: [],
      });
    }

    const alreadyCompleted = progress.completedTopics.some(
      (t) => String(t?.topicId) === String(topicId)
    );

    if (!alreadyCompleted) {
      progress.completedTopics.push({ topicId });
    }

    await progress.save();

    res.json({
      success: true,
      message: "Topic marked as complete",
      progress,
    });
  } catch (error) {
    console.error("Mark Topic Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseId are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let totalTopics = 0;

    if (course.topics) {
      totalTopics = course.topics.length;
    }

    if (course.chapters) {
      totalTopics = course.chapters.reduce(
        (acc, chapter) => acc + (chapter.topics?.length || 0),
        0
      );
    }

    const progress = await Progress.findOne({ studentId, courseId });

    const completedTopics = progress?.completedTopics || [];

    const completedCount = completedTopics.length;

    const percentage =
      totalTopics > 0
        ? Math.round((completedCount / totalTopics) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      totalTopics,
      completedCount,
      percentage,
      completedTopics, 
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllCoursesProgress = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const progressList = await Progress.find({ studentId })
      .populate("courseId", "title");

    const result = [];

    for (let progress of progressList) {
      const course = await Course.findById(progress.courseId._id);

      // 🔹 total topics count
      let totalTopics = 0;

      if (course?.chapters) {
        totalTopics = course.chapters.reduce(
          (acc, chapter) => acc + (chapter.topics?.length || 0),
          0
        );
      } else if (course?.topics) {
        totalTopics = course.topics.length;
      }

      const completedCount = progress.completedTopics.length;

      const percentage =
        totalTopics > 0
          ? Math.round((completedCount / totalTopics) * 100)
          : 0;

      result.push({
        courseId: progress.courseId._id,
        courseTitle: progress.courseId.title,
        totalTopics,
        completedCount,
        percentage,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching all progress:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};