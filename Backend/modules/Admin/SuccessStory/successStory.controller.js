import SuccessStory from "./successStory.model.js";

// Helper function to extract YouTube Video ID and Thumbnail
const getYoutubeThumbnail = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

export const AddSuccessStory = async (req, res, next) => {
  try {
    const { title, youtubeUrl, duration, order } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({
        message: "Title and YouTube URL are required",
        success: false,
      });
    }

    const thumbnailUrl = getYoutubeThumbnail(youtubeUrl);

    const successStory = await SuccessStory.create({
      title,
      youtubeUrl,
      thumbnailUrl,
      duration: duration || "00:00",
      order: order || 0,
    });

    return res.status(201).json({
      message: "Success story added successfully",
      success: true,
      data: successStory,
    });
  } catch (error) {
    next(error);
  }
};

export const GetSuccessStories = async (req, res, next) => {
  try {
    const stories = await SuccessStory.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    next(error);
  }
};

export const GetAllSuccessStoriesAdmin = async (req, res, next) => {
  try {
    const stories = await SuccessStory.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    next(error);
  }
};

export const UpdateSuccessStory = async (req, res, next) => {
  try {
    const { storyId, title, youtubeUrl, duration, order, isActive } = req.body;

    if (!storyId) {
      return res.status(400).json({
        message: "Story ID is required",
        success: false,
      });
    }

    const updateData = { title, youtubeUrl, duration, order, isActive };
    
    if (youtubeUrl) {
      updateData.thumbnailUrl = getYoutubeThumbnail(youtubeUrl);
    }

    const updatedStory = await SuccessStory.findByIdAndUpdate(
      storyId,
      updateData,
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Success story updated successfully",
      success: true,
      data: updatedStory,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteSuccessStory = async (req, res, next) => {
  try {
    const { storyId } = req.body;

    if (!storyId) {
      return res.status(400).json({
        message: "Story ID is required",
        success: false,
      });
    }

    const deletedStory = await SuccessStory.findByIdAndDelete(storyId);

    if (!deletedStory) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Success story deleted successfully",
      success: true,
      data: deletedStory,
    });
  } catch (error) {
    next(error);
  }
};
