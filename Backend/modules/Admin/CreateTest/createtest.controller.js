import { Test } from "./createtest.model.js";
import { emitNotification } from "../../../config/socket.js";


export const createTest = async (req, res) => {
  try {
    const { title, duration, passingPercentage, className, category, year, difficulty, description, isPaid, price } = req.body;

    const test = await Test.create({
      title,
      duration: duration || 60,
      className: className || '11th',
      passingPercentage: passingPercentage || 70,
      category: category || 'General',
      year: year ? String(year) : new Date().getFullYear().toString(),
      difficulty: difficulty || 'Medium',
      description: description || 'Test your knowledge with this comprehensive mock test.',
      isPaid: Boolean(isPaid),
      price: price ? Number(price) : 0
    });

    res.json({
      success: true,
      message: "Test created successfully",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateTest = async (req, res) => {
  try {
    const { testId, title, duration, passingPercentage, isPublished, className, category, year, difficulty, description, isPaid, price } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (title !== undefined) test.title = title;
    if (duration !== undefined) test.duration = duration;
    if (passingPercentage !== undefined) test.passingPercentage = passingPercentage;
    if (className !== undefined) test.className = className;
    if (category !== undefined) test.category = category;
    if (year !== undefined) test.year = String(year);
    if (difficulty !== undefined) test.difficulty = difficulty;
    if (description !== undefined) test.description = description;
    if (isPaid !== undefined) test.isPaid = Boolean(isPaid);
    if (price !== undefined) test.price = Number(price);
    if (isPublished !== undefined) {
      test.isPublished = isPublished;
    }

    await test.save();

    res.json({
      success: true,
      message: "Test updated successfully",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const DeleteTest = async(req,res,next)=>{
  try {
    const {testId} = req.body;
    if(!testId){
      return res.status(400).json({
        message:'testId is required',
        error:true,
        success:false
      })
    }

    const deletedTest = await Test.findByIdAndDelete(testId)
    return res.status(200).json({
      message:"test Deleted Successfully",
      error:false,
      success:true,
      data:deletedTest
    })

    
  } catch (error) {
    console.log(error)
  }
}


export const addQuestion = async (req, res) => {
  try {
    const { testId, question, options, correctAnswer, marks, questions, subject } = req.body;

    if (!testId) {
      return res.status(400).json({ success: false, message: "testId is required" });
    }

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    // Support bulk questions array upload
    if (Array.isArray(questions) && questions.length > 0) {
      let addedCount = 0;
      for (const q of questions) {
        const qText = q.question || q.questionText || q.text || "";
        const qOptions = Array.isArray(q.options) ? q.options : [];
        const qAns = q.correctAnswer !== undefined ? q.correctAnswer : (q.answer !== undefined ? q.answer : "");

        if (qText && qOptions.length > 0) {
          const qMarks = Number(q.marks) || 1;
          test.questions.push({
            question: qText,
            options: qOptions,
            correctAnswer: qAns,
            marks: qMarks,
            subject: (q.subject || subject || "").trim()
          });
          test.totalMarks = (test.totalMarks || 0) + qMarks;
          addedCount++;
        }
      }
      await test.save();
      return res.json({
        success: true,
        message: `${addedCount} questions added successfully`,
        data: test
      });
    }

    // Single question add
    const qMarks = Number(marks) || 1;
    test.questions.push({
      question,
      options,
      correctAnswer,
      marks: qMarks,
      subject: subject || ""
    });

    test.totalMarks = (test.totalMarks || 0) + qMarks;

    await test.save();

    res.json({
      success: true,
      message: "Question added successfully",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.body || {};
    let test;
    if (testId) {
      test = await Test.findById(testId);
    } else {
      test = await Test.find()
        .select("title duration className questions category difficulty description year isPublished passingPercentage totalMarks isPaid price")
        .sort({ createdAt: -1 });
    }

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json({
      success: true,
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { testId, questionId, question, options, correctAnswer, marks, subject } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const ques = test.questions.id(questionId);

    if (!ques) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question) ques.question = question;
    if (options) ques.options = options;
    if (correctAnswer !== undefined) ques.correctAnswer = correctAnswer;
    if (subject !== undefined) ques.subject = subject;

    if (marks !== undefined) {
      test.totalMarks = test.totalMarks - ques.marks + marks;
      ques.marks = marks;
    }

    await test.save();

    res.json({
      success: true,
      message: "Question updated",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const ques = test.questions.id(questionId);

    if (!ques) {
      return res.status(404).json({ message: "Question not found" });
    }

    test.totalMarks -= ques.marks;

    ques.deleteOne();

    await test.save();

    res.json({
      success: true,
      message: "Question deleted",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishTest = async (req, res) => {
  try {
    const { testId } = req.body;

    const test = await Test.findByIdAndUpdate(
      testId,
      { isPublished: true },
      { new: true }
    );

    // ✅ Emit Notification to Students
    emitNotification("students_room", "new_test_available", {
      title: test.title,
      duration: test.duration,
      totalMarks: test.totalMarks
    });

    res.json({
      success: true,
      message: "Test published",
      data: test
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublishedTests = async (req, res) => {
  try {
    const category = req.query?.category || req.body?.category;
    const year = req.query?.year || req.body?.year;
    const className = req.query?.className || req.body?.className;

    const queryFilter = { isPublished: true };

    if (category && category.toLowerCase() !== 'all') {
      const safeCategory = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryFilter.category = new RegExp(`^${safeCategory}$`, 'i');
    }
    if (year && year.toLowerCase() !== 'all') {
      queryFilter.year = String(year);
    }
    if (className) {
      queryFilter.className = className;
    }

    const tests = await Test.find(queryFilter)
      .select("title duration totalMarks questions className description difficulty category year isPaid price createdAt")
      .sort({ createdAt: -1 });

    const formattedTests = tests.map(test => ({
      _id: test._id,
      id: test._id,
      title: test.title,
      duration: test.duration,
      totalMarks: test.totalMarks || (test.questions ? test.questions.length : 0),
      totalQuestions: test.questions ? test.questions.length : 0,
      className: test.className,
      description: test.description,
      difficulty: test.difficulty || 'Medium',
      category: test.category || 'General',
      year: test.year || (test.createdAt ? new Date(test.createdAt).getFullYear().toString() : new Date().getFullYear().toString()),
      isPaid: Boolean(test.isPaid),
      price: Number(test.price) || 0,
      createdAt: test.createdAt
    }));

    res.json({
      success: true,
      data: formattedTests,
      tests: formattedTests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTestQuestionsForStudent = async (req, res) => {
  try {
    const { testId } = req.body;

    const test = await Test.findById(testId).select("title duration questions");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const safeQuestions = test.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      marks: q.marks,
      subject: q.subject || ""
    }));

    res.json({
      success: true,
      data: {
        title: test.title,
        duration: test.duration,
        questions: safeQuestions
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};