import express, { Router } from 'express'
import { addQuestion, createTest, deleteQuestion, DeleteTest, getPublishedTests, getQuestionsByTest, getTestQuestionsForStudent, publishTest, updateQuestion, updateTest } from './createtest.controller.js'

const testRouter = Router()
testRouter.post("/create_test",createTest)
testRouter.post("/edit_test",updateTest)
testRouter.post("/delete_test",DeleteTest)

testRouter.post("/add_question",addQuestion)
testRouter.post("/update_question",updateQuestion)
testRouter.post("/get_question",getQuestionsByTest)
testRouter.post("/delete_question",deleteQuestion)


testRouter.post("/isPublish",publishTest)
testRouter.post("/get_isPublish",getPublishedTests)

testRouter.post("/get_questions",getTestQuestionsForStudent)
export default testRouter   
