const Base_Url = import.meta.env.VITE_BASE_URL || "http://localhost:5050";

const api = {
    student:{
        register:Base_Url+"/student/register",
        login:Base_Url+"/student/login",
        getStudent:Base_Url+"/student/get-student",
        editProfile:Base_Url+"/student/std-profile-img",
        editprofiledetails:Base_Url+"/student/edit-profile-details",
        sendOtp:Base_Url+"/student/send-otp",
        verifyOTP:Base_Url+"/student/verify-otp",
        resetPassword:Base_Url+"/student/reset-password",
        getTestforStudent: Base_Url+"/student/get-testfor-student"
    },
    course:{
        getcourses:Base_Url+"/course/get_courses",
    },
     onlineClass:{
           getallclass:Base_Url+"/onlineClass/get_all_classes",
     },
      joinClass:{
        joinClasses:Base_Url+"/joinclass/join_class"
    },
    topic:{
        gettopicbyclass:Base_Url+"/topic/get_topicbyclass",
        //  gettopic:Base_Url+"/topic/get_topic",
    },
    blog:{
        getblog:Base_Url+"/blog/get_blogs",
    },
    slider:{
        getSlider:Base_Url+"/slider/get_slider"
    },
    testimonial:{
        getTestimonial:Base_Url+"/testimonial/get_testimonial",
    },
     fullcourse:{
        getApprovedcourse:Base_Url+"/course/get-approved-course",
        getCourseById:Base_Url+"/course/get-course-by-id"
    },
    test:{
      publishTest:Base_Url+"/test/get_isPublish",
      getQuestion:Base_Url+"/test/get_questions",
    
      
     },
     result:{
        submitTest:Base_Url+"/result/submit_test",
        attemptTest:Base_Url+"/result/check-existing-test",
        getStudentResults:Base_Url+"/result/get-student-results",
         startTest:Base_Url+"/result/start-test"
     },
     enrollment:{
       enrollCourse:Base_Url+"/student/enroll-course"
     },
     scholarship:{
        apply:Base_Url+"/scholarship/apply",

       enrollCourse:Base_Url+"/enrollment/enroll-course",
       getSchollership:Base_Url+"/scholarship/student-schollership"
     },
     payment:{
       createPayment:Base_Url+"/payment/create-payment",
       verifyPayment:Base_Url+"/payment/verify-payment",
       getPurchesCourse:Base_Url+"/payment/get-my-course"
     },
     successStory: {
       add: Base_Url + "/success-story/add",
       get: Base_Url + "/success-story/get",
       adminGet: Base_Url + "/success-story/admin/get-all",
       update: Base_Url + "/success-story/update",
       delete: Base_Url + "/success-story/delete",
     },
     callback: {
       request: Base_Url + "/callback/request",
       contact: Base_Url + "/callback/contact"
     },
     progress:{
      topicProgress:Base_Url+"/progress/mark-topic-complete",
      getProgress:Base_Url+"/progress/fatch-progress",
      getAllProgress:Base_Url+"/progress/fatch-all-progress"
     }
}



export default api