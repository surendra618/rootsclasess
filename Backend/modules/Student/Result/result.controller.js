import { Test } from "../../Admin/CreateTest/createtest.model.js";
import scholarshipModel from "../Scholrship/scholarship.model.js";
import { Result } from "./result.model.js";

// export const submitTest = async (req, res) => {
//   try {
//     const { studentId, testId, answers } = req.body;

//     console.log("Received submission:", {
//       studentId,
//       testId,
//       answers,
//     });

//     if (!studentId || !testId || !answers) {
//       return res.status(400).json({
//         success: false,
//         message: "studentId, testId and answers are required",
//       });
//     }

//     const test = await Test.findById(testId);

//     if (!test) {
//       return res.status(404).json({
//         success: false,
//         message: "Test not found",
//       });
//     }

//     const existingAttempt = await Result.findOne({
//       studentId,
//       testId,
//     });

//     if (!existingAttempt) {
//       return res.status(400).json({
//         success: false,
//         message: "Please start test first",
//       });
//     }

//     if (existingAttempt.isCompleted) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "You have already completed this test. You cannot retake it.",
//       });
//     }

//     const startTime = new Date(existingAttempt.testStartTime);
//     const currentTime = new Date();

//     const diffInMinutes =
//       (currentTime - startTime) / (1000 * 60);

//     console.log("Time spent:", diffInMinutes, "minutes");
//     let obtainedMarks = 0;
//     let totalMarks = 0;
//     const formattedAnswers = [];

//     test.questions.forEach((q) => {
//       totalMarks += q.marks;

//       const questionIdStr = q._id.toString();
//       const userAnswer = answers[questionIdStr];

//       const isCorrect =
//         userAnswer !== undefined &&
//         q.options[Number(userAnswer)]?.trim() ===
//           q.correctAnswer.trim();

//       if (isCorrect) {
//         obtainedMarks += q.marks;
//       }

//       formattedAnswers.push({
//         questionId: q._id,
//         selectedAnswer:
//           userAnswer !== undefined
//             ? Number(userAnswer)
//             : null,
//         isCorrect,
//       });
//     });

//     const percentage =
//       totalMarks > 0
//         ? (obtainedMarks / totalMarks) * 100
//         : 0;

//     const isEligible = percentage >= 70;

//     existingAttempt.obtainedMarks = obtainedMarks;
//     existingAttempt.totalMarks = totalMarks;
//     existingAttempt.percentage = percentage;
//     existingAttempt.isEligible = isEligible;
//     existingAttempt.answers = formattedAnswers;
//     existingAttempt.isCompleted = true;
//     existingAttempt.attemptDate = new Date();

//     await existingAttempt.save();

//     return res.status(200).json({
//       success: true,
//       message: "Test submitted successfully",
//       data: existingAttempt,
//     });

//   } catch (error) {
//     console.error("Error in submitTest:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const startTest = async (req, res) => {
  try {
    const { studentId, testId } = req.body;
    if (!studentId || !testId) {
      return res.status(400).json({ success: false, message: "studentId and testId are required" });
    }

    const existingAttempt = await Result.findOne({ studentId, testId });
    if (existingAttempt) {
      // Calculate if exit should be blocked (10 minutes)
      const elapsedMinutes = (new Date() - new Date(existingAttempt.testStartTime)) / (1000 * 60);
      const isExitBlocked = elapsedMinutes >= 10;

      // Return existing attempt (allows resuming)
      return res.status(200).json({ 
        success: true, 
        message: "Test already started", 
        data: existingAttempt,
        isExitBlocked 
      });
    }

    const newAttempt = await Result.create({
      studentId,
      testId,
      testStartTime: new Date(),
      isCompleted: false,
      obtainedMarks: 0,
      totalMarks: 0,
      percentage: 0,
      isEligible: false,
      answers: [],
    });

    return res.status(201).json({ 
      success: true, 
      message: "Test started successfully", 
      data: newAttempt,
      isExitBlocked: false 
    });
  } catch (error) {
    console.error("Error in startTest:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;
    if (!studentId || !testId || !answers) {
      return res.status(400).json({ success: false, message: "studentId, testId and answers are required" });
    }

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });

    const existingAttempt = await Result.findOne({ studentId, testId });
    if (!existingAttempt) return res.status(400).json({ success: false, message: "Please start test first" });
    if (existingAttempt.isCompleted) {
      return res.status(400).json({ success: false, message: "You have already completed this test. You cannot retake it." });
    }

    // ✅ No time restriction for submission – submit button always works.
    let obtainedMarks = 0;
    let totalMarks = 0;
    const formattedAnswers = [];

    test.questions.forEach((q) => {
      totalMarks += q.marks;
      const questionIdStr = q._id.toString();
      const userAnswer = answers[questionIdStr];
      
      let isCorrect = false;
      if (userAnswer !== undefined && q.options[Number(userAnswer)]) {
        const selectedOption = q.options[Number(userAnswer)];
        
        // 1. Try plain string comparison (if both are strings)
        if (typeof q.correctAnswer === 'string' && typeof selectedOption === 'string') {
          if (q.correctAnswer.trim() === selectedOption.trim()) {
            isCorrect = true;
          }
        }
        
        // 2. Try bilingual object comparison (if strings didn't match or were objects)
        if (!isCorrect) {
          const correctEng = q.correctAnswer?.english?.trim();
          const selectedEng = selectedOption?.english?.trim();
          
          if (correctEng && selectedEng && correctEng === selectedEng) {
            isCorrect = true;
          } else {
            const correctHindi = q.correctAnswer?.hindi?.trim();
            const selectedHindi = selectedOption?.hindi?.trim();
            if (correctHindi && selectedHindi && correctHindi === selectedHindi) {
              isCorrect = true;
            }
          }
        }
      }

      if (isCorrect) obtainedMarks += q.marks;
      formattedAnswers.push({
        questionId: q._id,
        selectedAnswer: userAnswer !== undefined ? Number(userAnswer) : null,
        isCorrect,
      });
    });

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const isEligible = percentage >= 70;

    existingAttempt.obtainedMarks = obtainedMarks;
    existingAttempt.totalMarks = totalMarks;
    existingAttempt.percentage = percentage;
    existingAttempt.isEligible = isEligible;
    existingAttempt.answers = formattedAnswers;
    existingAttempt.isCompleted = true;
    existingAttempt.attemptDate = new Date();

    await existingAttempt.save();

    return res.status(200).json({ success: true, message: "Test submitted successfully", data: existingAttempt });
  } catch (error) {
    console.error("Error in submitTest:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkTestAttempt = async (req, res, next) => {
  try {
    const { studentId, testId } = req.body;
    const existing = await Result.findOne({ studentId, testId })

    return res.status(200).json({
      attempted: !!existing,
      success: true,
      data: existing
    })

  } catch (error) {
    next(error)
  }
}

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required"
      });
    }

    const results = await Result.find({ studentId }).populate('testId').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Student results fetched successfully",
      data: results
    });

  } catch (error) {
    console.error('Error in getStudentResults:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "fullName email")
      .populate("testId", "title");

    const updatedResults = await Promise.all(
      results.map(async (r) => {
        const scholarship = await scholarshipModel.findOne({
          studentId: r.studentId?._id
        });

        return {
          ...r._doc,
          scholarshipId: scholarship?._id || null, 
          scholarshipStatus: scholarship?.status || "not_applied"
        };
      })
    );

    res.status(200).json({
      success: true,
      data: updatedResults,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};