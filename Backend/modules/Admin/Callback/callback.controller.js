import { sendCallbackEmail } from "../../../config/emailServices.js";

export const RequestExpertAdvice = async (req, res, next) => {
  try {
    const { firstName, lastName, mobileNumber, email, stream, studentClass } = req.body;

    if (!firstName || !mobileNumber || !email || !stream || !studentClass) {
      return res.status(400).json({
        message: "Please fill all required fields",
        success: false,
      });
    }

    const emailSent = await sendCallbackEmail({
      firstName,
      lastName: lastName || "",
      mobileNumber,
      email,
      stream,
      studentClass,
    });

    if (emailSent) {
      return res.status(200).json({
        message: "Your request has been submitted successfully. Our experts will contact you soon.",
        success: true,
      });
    } else {
      return res.status(500).json({
        message: "Failed to submit request. Please try again later.",
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const SubmitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill all required fields",
        success: false,
      });
    }

    const { sendContactEmail } = await import("../../../config/emailServices.js");
    const emailSent = await sendContactEmail({ name, email, subject, message });

    if (emailSent) {
      return res.status(200).json({
        message: "Message sent! We'll get back to you soon.",
        success: true,
      });
    } else {
      return res.status(500).json({
        message: "Failed to send message. Please try again later.",
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};
