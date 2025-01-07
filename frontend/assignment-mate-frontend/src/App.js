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
import Logout from './LogOut';
import PrivateRoute from './PrivateRoute';
import AttemptsList from './components/AttemptList';

function App() {
    return (
        <Router>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
                <motion.nav className="container mx-auto p-4 flex justify-between items-center mt-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex space-x-6">
                        <Link to="/quizzes" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Quizzes</Link>
                        <Link to="/quiz/generate" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Generate Quiz</Link>
                        <Link to="/quiz/history" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Quiz History</Link>
                    </div>
                    <div>
                        {localStorage.getItem('access_token') ? <Logout /> : <Link to="/login" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Login</Link>}
                    </div>
                </motion.nav>
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
