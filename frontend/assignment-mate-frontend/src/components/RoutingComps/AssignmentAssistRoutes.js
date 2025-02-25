import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import DocumentUpload from "../AssignmentAssist-comps/DocumentUpload";
import DocumentList from "../AssignmentAssist-comps/DocumentView";
import AssignmentAssistNavBar from "../AssignmentAssist-comps/AssignmentAssistNavBar";
import ExtractQuestions from "../AssignmentAssist-comps/ExtractedQuestions";
import ViewAnswers from "../AssignmentAssist-comps/ViewAnswers";

export default function AssignmentAssistRoutes() {
    return (
        <>
            <AssignmentAssistNavBar />
            <Routes>
                <Route path="/assignment-assist/uploadPDF" element={<PrivateRoute><DocumentUpload /></PrivateRoute>} />
                <Route path="/assignment-assist/" element={<PrivateRoute><DocumentList /></PrivateRoute>} />
                <Route path="/assignment-assist/:documentId/viewAnswers/" element={<PrivateRoute><ViewAnswers /></PrivateRoute>} />
                <Route path="/assignment-assist/extracted-questions/:documentId/" element={<PrivateRoute><ExtractQuestions /></PrivateRoute>} />
            </Routes>
        </>
    )
}