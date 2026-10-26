const BACKEND_URL = "https://rootsclasess.vercel.app";
const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const Base_Url = import.meta.env.VITE_BASE_URL || (isLocal ? "http://localhost:5050" : BACKEND_URL);

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
      getpurchesCourse:Base_Url+"/enroll/get-purches-course",
      getpurchesTest:Base_Url+"/enroll/get-purches-test",
      getAllTestPurchases:Base_Url+"/enroll/get-all-test-purchases"
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
     schollership: {
        allApplications: Base_Url + "/scholarship/all",
        grantScholarship: Base_Url + "/scholarship/approve",
        rejectScholarship: Base_Url + "/scholarship/reject",
        deleteScholarship: Base_Url + "/scholarship/delete",
        getApprovedReject: Base_Url + "/scholarship/approved-rejected",
        schollershipResult: Base_Url + "/result/get-all-results",
        scholarshipResult: Base_Url + "/result/get-all-results",
        grantTestAccess: Base_Url + "/scholarship/grant-test-access",
        revokeTestAccess: Base_Url + "/scholarship/revoke-test-access",
        getAvailableTests: Base_Url + "/scholarship/available-tests"
     },
     scholarship: {
        allApplications: Base_Url + "/scholarship/all",
        grantScholarship: Base_Url + "/scholarship/approve",
        rejectScholarship: Base_Url + "/scholarship/reject",
        deleteScholarship: Base_Url + "/scholarship/delete",
        getApprovedReject: Base_Url + "/scholarship/approved-rejected",
        scholarshipResult: Base_Url + "/result/get-all-results",
        schollershipResult: Base_Url + "/result/get-all-results",
        grantTestAccess: Base_Url + "/scholarship/grant-test-access",
        revokeTestAccess: Base_Url + "/scholarship/revoke-test-access",
        getAvailableTests: Base_Url + "/scholarship/available-tests"
     },
     policy: {
        getPolicy: (type) => `${Base_Url}/policy/get/${type}`,
        updatePolicy: `${Base_Url}/policy/update`,
        uploadPdf: `${Base_Url}/policy/upload-pdf`,
        getAll: `${Base_Url}/policy/all`
     }
}
export default api
