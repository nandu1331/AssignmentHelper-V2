import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import QuizList from "../Quiz-comps/QuizList"
import QuizAttempt from "../Quiz-comps/QuizAttempt"
import AttemptsList from "../Quiz-comps/AttemptList"
import QuizResults from "../Quiz-comps/QuizResults"
import QuizGenerator from "../Quiz-comps/QuizGenerator"
import QuizHistory from "../Quiz-comps/QuizHistory"
import QuizNavBar from "../Quiz-comps/QuizNavBar";

export default function QuizRoutes() {
    return (
        <>
            <QuizNavBar />
            <Routes>
                <Route path="/quizzes" element={<PrivateRoute><QuizList /></PrivateRoute>} />
                <Route path="/quiz/attempt/:quizId" element={<PrivateRoute><QuizAttempt /></PrivateRoute>} />
                <Route path="/quiz/results/:quizId" element={<PrivateRoute><AttemptsList /></PrivateRoute>} />
                <Route path="/quiz/results/:quizId/:attemptId" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
                <Route path="/quiz/generate" element={<PrivateRoute><QuizGenerator /></PrivateRoute>} />
                <Route path="/quiz/history" element={<PrivateRoute><QuizHistory /></PrivateRoute>} />
            </Routes>
        </>
    )
}