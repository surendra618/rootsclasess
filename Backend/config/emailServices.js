import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Pre-verify and warm up SMTP connection
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((error) => {
        if (error) {
            console.warn("⚠️ SMTP Transporter Connection Warning:", error.message);
        } else {
            console.log("✅ Nodemailer SMTP Transporter ready & connected!");
        }
    });
} else {
    console.error("❌ CRITICAL: EMAIL_USER or EMAIL_PASS environment variables are missing on this server!");
}

// Function to send OTP
const sendOTP = async (email, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_USER or EMAIL_PASS is missing in server environment variables!');
            return false;
        }

        const mailOptions = {
            from: `"Roots Classes" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP Code - Roots Classes',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 25px;">
                    <h2 style="color: #4F46E5; margin-top: 0;">Email Verification</h2>
                    <p style="font-size: 15px; color: #333;">Your OTP verification code is:</p>
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                        <h1 style="font-size: 34px; color: #4F46E5; letter-spacing: 6px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #555; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p style="color: #777; font-size: 13px;">If you didn't request this code, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; margin-bottom: 0;">© ${new Date().getFullYear()} Roots Classes. All rights reserved.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP Email sent successfully to:', email, 'Response:', info.response || info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email to', email, ':', error);
        return false;
    }
};

// Function to send Callback Request to Admin
const sendCallbackEmail = async (userData) => {
    try {
        const { firstName, lastName, mobileNumber, email, stream, studentClass } = userData;

        const mailOptions = {
            from: `"Roots Classes Portal" <${process.env.EMAIL_USER}>`,
            to: "rootsclasses1313@gmail.com",
            subject: 'New Expert Advice Request - Roots Classes',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">New Callback Request</h2>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        <p>Dear Admin,</p>
                        <p>A new user has submitted the <strong>Get Expert Advice</strong> form on the website. Below are the details:</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4F46E5; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">User Information</h3>
                            <p style="margin: 8px 0;"><strong>First Name:</strong> ${firstName}</p>
                            <p style="margin: 8px 0;"><strong>Last Name:</strong> ${lastName}</p>
                            <p style="margin: 8px 0;"><strong>Mobile Number:</strong> ${mobileNumber}</p>
                            <p style="margin: 8px 0;"><strong>Email ID:</strong> ${email}</p>
                            
                            <h3 style="color: #4F46E5; margin: 20px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Academic Details</h3>
                            <p style="margin: 8px 0;"><strong>Stream:</strong> ${stream}</p>
                            <p style="margin: 8px 0;"><strong>Class:</strong> ${studentClass}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; font-style: italic;">
                            * User has agreed to receive WhatsApp communication and accepted the Terms & Conditions and Privacy Policy.
                        </p>
                        
                        <p style="margin-top: 30px;">Please reach out to the user at the earliest to provide assistance.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                            RootsClasses Portal • Automated Notification
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Callback Email sent: ', info.response);
        return true;
    } catch (error) {
        console.error('Error sending callback email:', error);
        return false;
    }
};

// Function to send Contact Form Email to Admin
const sendContactEmail = async (userData) => {
    try {
        const { name, email, subject, message } = userData;

        const mailOptions = {
            from: `"Roots Classes Contact" <${process.env.EMAIL_USER}>`,
            to: "rootsclasses1313@gmail.com",
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #FB0500; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">New Message Received</h2>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        <p><strong>From:</strong> ${name} (${email})</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p style="white-space: pre-wrap;">${message}</p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                            RootsClasses Portal • Contact Form Submission
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Contact Email sent: ', info.response);
        return true;
    } catch (error) {
        console.error('Error sending contact email:', error);
        return false;
    }
};

 const sendReceiptEmail = async (student, enrollment, course, filePath) => {
  try {
    const mailOptions = {
      from: `"Roots Classes" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: "Payment Successful - Course Enrollment Confirmation 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #4F46E5;">Payment Successful!</h2>
            <p style="font-size: 16px; color: #333;">Thank you for your purchase</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Hello ${student.fullName || student.name},</strong></p>
            <p style="margin: 0;">Your payment has been successfully completed and you are now enrolled in the course.</p>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #374151;">Course Details:</h3>
            <p><strong>Course Name:</strong> ${course.title}</p>
            <p><strong>Enrollment ID:</strong> ${enrollment._id}</p>
            <p><strong>Order ID:</strong> ${enrollment.orderId}</p>
            <p><strong>Payment ID:</strong> ${enrollment.paymentId}</p>
            <p><strong>Enrolled On:</strong> ${new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #374151;">Payment Summary:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;">Original Price:</td>
                <td style="padding: 8px 0; text-align: right;">₹${enrollment.originalPrice?.toLocaleString('en-IN') || 0}</td>
              </tr>
              ${enrollment.discountApplied > 0 ? `
              <tr style="color: #059669;">
                <td style="padding: 8px 0;">Discount (${enrollment.discountApplied}%):</td>
                <td style="padding: 8px 0; text-align: right;">-₹${((enrollment.originalPrice || 0) - (enrollment.amount || 0)).toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 0 0; font-weight: bold;">Total Paid:</td>
                <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; color: #4F46E5;">₹${enrollment.amount?.toLocaleString('en-IN') || 0}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #1e40af;">✓ You now have full access to all course materials</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #3b82f6;">Login to your dashboard to start learning</p>
          </div>
          
          <p style="margin-top: 30px;">Please find your payment receipt attached with this email.</p>
          
          <p style="margin-top: 20px;">Thank you for choosing Roots Classes! 🚀</p>
          
          <hr style="margin: 30px 0 20px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            This is an automated email. Please do not reply.<br />
            For any assistance, contact us at support@rootsclasses.com
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `receipt_${enrollment._id}.pdf`,
          path: filePath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Receipt Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return false;
  }
};


 const sendScholarshipEmail = async (studentEmail, studentName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: "Scholarship Approved 🎉",
      html: `
        <h2>Congratulations ${studentName}!</h2>
        <p>Your scholarship application has been <b>approved</b>.</p>
        <p>“You can now purchase courses with a discount. Go to the Courses page where all the details are available.” </p>
      `
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
  }
};

export { sendOTP, sendCallbackEmail, sendContactEmail,sendReceiptEmail,sendScholarshipEmail  };
