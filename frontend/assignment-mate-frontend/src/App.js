import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuizList from './components/QuizList';
import QuizAttempt from './components/QuizAttempt';
import QuizResults from './components/QuizResults';
import QuizGenerator from './components/QuizGenerator';
import QuizHistory from './components/QuizHistory';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
// ... imports
import Login from './Login';
import NavBar from './components/NavBar';
import PrivateRoute from './PrivateRoute';
import AttemptsList from './components/AttemptList';

function App() {
    return (
        <Router>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
                <NavBar />
                <div className="container mx-auto p-4 mt-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/quizzes" />} />
                        <Route path="/quizzes" element={<PrivateRoute><QuizList /></PrivateRoute>} />
                        <Route path="/quiz/attempt/:quizId" element={<PrivateRoute><QuizAttempt /></PrivateRoute>} />
                        <Route path="/quiz/results/:quizId" element={<PrivateRoute><AttemptsList /></PrivateRoute>} />
                        <Route path="/quiz/results/:quizId/:attemptId" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
                        <Route path="/quiz/generate" element={<PrivateRoute><QuizGenerator /></PrivateRoute>} />
                        <Route path="/quiz/history" element={<PrivateRoute><QuizHistory /></PrivateRoute>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
