
const Base_Url = import.meta.env.VITE_BASE_URL || "http://localhost:5050";

const api ={
    admin:{
        getStudents:Base_Url+"/admin/getall_student",
        toggleBanStudent:Base_Url+"/admin/toggle-ban-student",
        changePassword:Base_Url+"/admin/change-password"
    },
    category:{
        createcategory:Base_Url+"/category/create_category",
        getcategory:Base_Url+"/category/get_category",
        UpdateCategory:Base_Url+"/category/edit_category",
        deletecategory:Base_Url+"/category/delete_category"
    },
    onlineClass:{
        createclass:Base_Url+"/onlineClass/create_class",
        getclass:Base_Url+"/onlineClass/get_class",
        editclass:Base_Url+"/onlineClass/edit_class",
        deleteclass:Base_Url+"/onlineClass/delete_class",
    },
    joinclass:{
        getstdcount:Base_Url+"/joinclass/get_stdcount"
        
    },
    topic:{
        createTopic:Base_Url+"/topic/create_topic",
        gettopicbyclass:Base_Url+"/topic/get_topicbyclass",
        updateTopic:Base_Url+"/topic/update_topic",
        deletetopic:Base_Url+"/topic/delete_topic"
    },
    blog:{
        createblog:Base_Url+"/blog/create_blog",
        getblog:Base_Url+"/blog/get_blogs",
        editblog:Base_Url+"/blog/update_blog",
        deleteblog:Base_Url+"/blog/delete_blog"
    },
    slider:{
        createSlider:Base_Url+"/slider/create_slider",
        getSlider:Base_Url+"/slider/get_slider",
        editSlider:Base_Url+"/slider/edit_slider",
        deleteSlider:Base_Url+"/slider/delete_slider"
    },
    testimonial:{
        addTestimonial:Base_Url+"/testimonial/add_testimonial",
        getTestimonial:Base_Url+"/testimonial/get_testimonial",
        editTestimonial:Base_Url+"/testimonial/update_testimonial",
        deleteTestimonial:Base_Url+"/testimonial/delete_testinomial"
    },
    fullcourse:{
        getfullcourse:Base_Url+"/course/get-full-course",
        approvedCourse:Base_Url+"/course/approved-course",
    },
    enroll:{
      getpurchesCourse:Base_Url+"/enroll/get-purches-course"
    },
    test:{
      createTest:Base_Url+"/test/create_test",
      editTest:Base_Url+"/test/edit_test",
      deleteTest:Base_Url+"/test/delete_test",
      addQuestion:Base_Url+"/test/add_question",
      getQuestion:Base_Url+"/test/get_question",
      editQuestion:Base_Url+"/test/update_question",
      deleteQuestion:Base_Url+"/test/delete_question",

      isPublished:Base_Url+"/test/isPublish"
     },
     faculty: {
         create: Base_Url + "/faculty/create",
         get: Base_Url + "/faculty/get",
         update: Base_Url + "/faculty/update",
         delete: Base_Url + "/faculty/delete"
     },
     successStory: {
         create: Base_Url + "/success-story/create",
         get: Base_Url + "/success-story/get",
         update: Base_Url + "/success-story/update",
         delete: Base_Url + "/success-story/delete"
     },
     schollership:{
        schollershipResult:Base_Url+"/result/get-all-results",
        grantScholarship:Base_Url+"/scholarship/approve",
        rejectScholarship:Base_Url+"/scholarship/reject",
        getApprovedReject:Base_Url+"/scholarship/approved-rejected"
     }

    
}
export default api
