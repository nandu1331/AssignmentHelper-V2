import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logout from "../LogOut"

export default function NavBar() {
    return (
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
    )
}