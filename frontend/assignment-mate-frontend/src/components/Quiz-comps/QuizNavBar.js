import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logout from "../Authentication/LogOut"
import { useNavigate } from "react-router-dom";

export default function QuizNavBar() {
    const navigate = useNavigate();
    return (
        <motion.nav className="mx-auto p-4 min-w-[100%] flex justify-between" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex space-x-6">
                        <Link to="/features" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Home</Link>
                        <Link to="/quizzes" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Quizzes</Link>
                        <Link to="/quiz/generate" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Generate Quiz</Link>
                        <Link to="/quiz/history" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Quiz History</Link>
                    </div>
                    <div>
                        {localStorage.getItem('access_token') ? <Logout /> : navigate('/login')}
                    </div>
                </motion.nav>
    )
}