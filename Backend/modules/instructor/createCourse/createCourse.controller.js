import mongoose from "mongoose";
import { Course } from "./createCourse.model.js";
import { Category } from "../../Admin/category/category.model.js";
import cloudinary from "../../../config/cloudinary.js";
import User from "../../Student/student.model.js"


export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;
    console.log(req.body, "dfffffffffffffffffffff")

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and Category are required",
      });
    }



    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    console.log(req.user)
    const course = await Course.create({
      title,
      description,
      category,
      price,
      level: level || "beginner",
      instructor: req.user?._id,
      instructorName: req.user?.fullName || "Instructor Name Not Available",
      modules: [],
      status: "pending"
    });


    console.log("USER:", req.user);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetCategory = async (req, res, next) => {
  try {
    const categories = await Category.find().select("name")
    return res.status(200).json({
      message: "this is categories",
      success: true,
      data: categories
    })

  } catch (error) {
    next(error)
  }
}
export const GetCreatedCourse = async (req, res, next) => {
  try {
    const CreatedCourse = await Course.find()
      .populate("instructor", "fullName email")
    return res.status(200).json({
      message: "fatch all course successfully",
      error: false,
      success: true,
      data: CreatedCourse
    })

  } catch (error) {
    next(error)
  }
}



export const UpdateCourse = async (req, res, next) => {
  try {
    const { courseId, title, description, category, level, price } = req.body;

    // 🔥 1. Check courseId
    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        error: true,
        success: false,
      });
    }

    // 🔥 2. Check course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
        error: true,
        success: false,
      });
    }

    // 🔥 3. Optional: Validate category
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
        error: true,
      });
    }

    // 🔥 4. Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        category: category || existingCourse.category,
        level: level || existingCourse.level,
        price: price || existingCourse.price,
        instructorName: existingCourse.instructorName || req.user?.fullName,
      },
      { returnDocument: "after" }
    );

    // 🔥 5. Send response
    res.status(200).json({
      message: "Course updated successfully",
      success: true,
      error: false,
      data: updatedCourse,
    });

  } catch (error) {
    next(error);
  }
};

export const DeleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const deletecourse = await Course.findByIdAndDelete(courseId)
    return res.status(200).json({
      message: "course deleted successfully",
      error: false,
      success: true,
      data: deletecourse
    })


  } catch (error) {
    next(error)
  }
}


export const handleGetCourseById = async (req, res, next) => {
  try {
    console.log("Fetching course by ID");
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "courseId is required",
        success: false
      });
    }

    // ✅ CORRECT: Use lowercase 'category' (field name from schema)
    const course = await Course.findById(courseId).populate('category').populate('instructor', "fullName email profileImage role");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Course details fetched successfully",
      success: true,
      data: course
    });

  } catch (error) {
    console.log(error, "Error from handleGetCourseById");
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};


export const handleAddModule = async (req, res, next) => {
  try {
    const { title, courseId } = req.body;
    console.log(req.body, "this is my request body of handleAddModule");

    // Validate required fields
    if (!title || !courseId) {
      return res.status(400).json({
        message: "Title and courseId are required",
        success: false
      });
    }

    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    // Create new module object
    const newModule = {
      title: title,
      chapters: []  // Empty chapters array initially
    };

    // Push the new module to the course modules array
    course.modules.push(newModule);

    // Save the course
    await course.save();

    // Get the newly added module (last one in the array)
    const addedModule = course.modules[course.modules.length - 1];

    return res.status(200).json({
      message: "Module added successfully",
      success: true,
      data: {
        module: addedModule,
        course: course
      }
    });

  } catch (error) {
    console.error("Error in handleAddModule:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

export const handleUpdateModule = async (req, res, next) => {
  try {
    const { courseId, moduleId, title } = req.body;

    if (!courseId || !moduleId || !title) {
      return res.status(400).json({
        message: "courseId, moduleId, and title are required",
        success: false
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    // Find the module by id and update its title
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        message: "Module not found",
        success: false
      });
    }

    module.title = title;
    await course.save();

    return res.status(200).json({
      message: "Module updated successfully",
      success: true,
      data: course
    });

  } catch (error) {
    console.error("Error in handleUpdateModule:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

export const handleDeleteModule = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({
        message: "courseId and moduleId are required",
        success: false
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { modules: { _id: moduleId } }
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Module deleted successfully",
      success: true,
      data: course
    });

  } catch (error) {
    console.error("Error in handleDeleteModule:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

export const handleAddChapter = async (req, res, next) => {
  try {
    const { courseId, moduleId, title } = req.body;

    if (!courseId || !moduleId || !title) {
      return res.status(400).json({
        message: "courseId, moduleId, and title are required",
        success: false
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    // Find the module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        message: "Module not found",
        success: false
      });
    }

    // Add new chapter
    const newChapter = {
      title: title,
      topics: []
    };

    module.chapters.push(newChapter);
    await course.save();

    const addedChapter = module.chapters[module.chapters.length - 1];

    return res.status(200).json({
      message: "Chapter added successfully",
      success: true,
      data: {
        chapter: addedChapter,
        course: course
      }
    });

  } catch (error) {
    console.error("Error in handleAddChapter:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

export const handleUpdateChapter = async (req, res, next) => {
  try {
    const { courseId, moduleId, chapterId, title } = req.body;

    if (!courseId || !moduleId || !chapterId || !title) {
      return res.status(400).json({
        message: "courseId, moduleId, chapterId, and title are required",
        success: false
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        message: "Module not found",
        success: false
      });
    }

    const chapter = module.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({
        message: "Chapter not found",
        success: false
      });
    }

    chapter.title = title;
    await course.save();

    return res.status(200).json({
      message: "Chapter updated successfully",
      success: true,
      data: course
    });

  } catch (error) {
    console.error("Error in handleUpdateChapter:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};


export const handleDeleteChapter = async (req, res) => {
  try {
    const { courseId, moduleId, chapterId } = req.body;

    if (!courseId || !moduleId || !chapterId) {
      return res.status(400).json({
        success: false,
        message: "courseId, moduleId, and chapterId are required"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const chapter = module.chapters.id(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }

    // delete chapter
    chapter.deleteOne();

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
      data: course
    });

  } catch (error) {
    console.error("Error in handleDeleteChapter:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const handleAddTopic = async (req, res) => {
  try {
    const {
      courseId,
      moduleId,
      chapterId,
      title,
      description,
      isPreviewFree,
      order,
      videoType,
      youtubeUrl
    } = req.body;

    const isPreviewFreeBool =
      isPreviewFree === "true" || isPreviewFree === true;

    if (!courseId || !moduleId || !chapterId || !title) {
      return res.status(400).json({
        success: false,
        message: "courseId, moduleId, chapterId, and title are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const chapter = module.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    let videoUrl = "";
    let videoPublicId = "";

    let notesUrl = "";
    let notesPublicId = "";


    if (videoType === "youtube") {
      if (!youtubeUrl) {
        return res.status(400).json({
          success: false,
          message: "YouTube URL is required",
        });
      }

      if (
        !youtubeUrl.includes("youtube.com") &&
        !youtubeUrl.includes("youtu.be")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL",
        });
      }

      videoUrl = youtubeUrl;
    }

    else if (videoType === "upload") {
      if (!req.files?.video) {
        return res.status(400).json({
          success: false,
          message: "Video file is required",
        });
      }

      const videoFile = Array.isArray(req.files.video)
        ? req.files.video[0]
        : req.files.video;

      const videoUpload = await cloudinary.uploader.upload(
        videoFile.path,
        {
          folder: "lms/videos",
          resource_type: "video",
        }
      );

      videoUrl = videoUpload.secure_url;
      videoPublicId = videoUpload.public_id;
    }

    if (req.files?.notes) {
      const notesFile = Array.isArray(req.files.notes)
        ? req.files.notes[0]
        : req.files.notes;

      const notesUpload = await cloudinary.uploader.upload(
        notesFile.path,
        {
          folder: "lms/notes",
          resource_type: "raw",
        }
      );

      notesUrl = notesUpload.secure_url;
      notesPublicId = notesUpload.public_id;
    }

    const newTopic = {
      title,
      description: description || "",
      videoType: videoType || "upload",
      videoUrl,
      videoPublicId,
      youtubeUrl: videoType === "youtube" ? youtubeUrl : "",
      notesUrl,
      notesPublicId,
      isPreviewFree: isPreviewFreeBool,
      order: order || 0,
      resources: [],
      createdAt: new Date(),
    };

    chapter.topics.push(newTopic);
    await course.save();

    const addedTopic = chapter.topics[chapter.topics.length - 1];

    res.status(200).json({
      success: true,
      message: "Topic added successfully",
      data: addedTopic,
    });

  } catch (error) {
    console.error("Error in handleAddTopic:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


export const handleEditTopic = async (req, res) => {
  try {
    const {
      courseId,
      moduleId,
      chapterId,
      topicId,
      title,
      description,
      isPreviewFree,
      order,
      videoType,
      youtubeUrl
    } = req.body;

    if (!courseId || !moduleId || !chapterId || !topicId) {
      return res.status(400).json({
        success: false,
        message: "courseId, moduleId, chapterId and topicId are required"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const chapter = module.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }

    const topic = chapter.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // ✅ Update basic fields
    if (title) topic.title = title;
    if (description) topic.description = description;
    if (order) topic.order = order;
    if (isPreviewFree !== undefined) topic.isPreviewFree = isPreviewFree;

    let videoUrl = topic.videoUrl;
    let videoPublicId = topic.videoPublicId;

    // 🎬 VIDEO LOGIC (YouTube + Upload)
    if (videoType === "youtube" && youtubeUrl) {
      topic.videoType = "youtube";
      topic.youtubeUrl = youtubeUrl;

      // old uploaded video हटाना (optional but recommended)
      if (topic.videoPublicId) {
        await cloudinary.uploader.destroy(topic.videoPublicId, {
          resource_type: "video"
        });
      }

      topic.videoUrl = youtubeUrl;
      topic.videoPublicId = "";

    }
    else if (req.files?.video) {
      const videoUpload = await cloudinary.uploader.upload(
        req.files.video[0].path,
        {
          folder: "lms/videos",
          resource_type: "video"
        }
      );

      topic.videoType = "upload";
      topic.videoUrl = videoUpload.secure_url;
      topic.videoPublicId = videoUpload.public_id;
      topic.youtubeUrl = "";
    }

    // 📄 NOTES UPDATE
    if (req.files?.notes) {
      const notesUpload = await cloudinary.uploader.upload(
        req.files.notes[0].path,
        {
          folder: "lms/notes",
          resource_type: "raw"
        }
      );

      topic.notesUrl = notesUpload.secure_url;
      topic.notesPublicId = notesUpload.public_id;
    } else if (req.body.removeNotes === "true" || req.body.removeNotes === true) {
      // If we want to remove existing notes and no new file is uploaded
      if (topic.notesPublicId) {
        try {
          await cloudinary.uploader.destroy(topic.notesPublicId, {
            resource_type: "raw"
          });
        } catch (cloudinaryError) {
          console.error("Cloudinary error removing notes:", cloudinaryError);
        }
      }
      topic.notesUrl = "";
      topic.notesPublicId = "";
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: topic
    });

  } catch (error) {
    console.error("Error in handleEditTopic:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const DeleteTopic = async (req, res) => {
  try {
    const { courseId, moduleId, chapterId, topicId } = req.body;

    if (!courseId || !moduleId || !chapterId || !topicId) {
      return res.status(400).json({
        success: false,
        message: "courseId, moduleId, chapterId, topicId are required"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const module = course.modules.id(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const chapter = module.chapters.id(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }

    const topic = chapter.topics.id(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    topic.deleteOne();

    await course.save();

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully"
    });

  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getFullCourseDetails = async (req, res) => {
  try {
    const course = await Course.find()
      .populate({
        path: "category",
        select: "name"
      })
      .populate({
        path: "instructor",
      });

    console.log(JSON.stringify(course, null, 2));

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Full course fetched successfully",
      data: course,
    });

  } catch (error) {
    console.error("Error in getFullCourseDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const approvedCourse = async (req, res, next) => {
  try {
    const { courseId, status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status },
      { new: true }
    )

    if (!course) {
      return res.status(404).json({
        success: true,
        message: "course not found"
      })
    }

    res.status(200).json({
      success: true,
      message: `Course ${status} successfully`,
      data: course,
    });

  } catch (error) {
    next(error)
  }
}

export const getApprovedCourse = async (req, res, next) => {
  try {
    const course = await Course.find({
      status: "approved",
    })
      .populate("category", "name")
      .populate("instructor", "fullName email phone role");

    if (!course || course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No approved courses found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Approved courses fetched successfully",
      data: course,
    });

  } catch (error) {
    console.error("Error in getFullCourseDetails:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
export const getInstructorById = async (req, res) => {
  try {
    const { instructorId } = req.body;

    const instructor = await User.findById(instructorId).select(
      "fullName email profileImage role"
    );

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    if (instructor.role !== "instructor") {
      return res.status(400).json({
        success: false,
        message: "User is not an instructor",
      });
    }

    res.status(200).json({
      success: true,
      message: "Instructor details fetched successfully",
      instructor: {
        id: instructor._id,
        name: instructor.fullName,
        email: instructor.email,
        profileImage: instructor.profileImage,
        role: instructor.role,
      },
    });

  } catch (error) {
    console.log("Get Instructor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};








