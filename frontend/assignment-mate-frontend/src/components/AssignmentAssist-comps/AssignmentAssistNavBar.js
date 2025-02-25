import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logout from "../Authentication/LogOut"

export default function AssignmentAssistNavBar() {
    return (
        <motion.nav className="container mx-auto p-4 min-w-[100%] flex justify-between items-center mt-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex space-x-6">
                        <Link to="/features" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Home</Link>
                        <Link to="/assignment-assist/uploadPDF" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Upload Files</Link>
                        <Link to="/assignment-assist/" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Dashboard</Link>
                        <Link to="/assignment-assist/:documentId/viewAnswers" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">View Answers</Link>
                    </div>
                    <div>
                        {localStorage.getItem('access_token') ? <Logout /> : <Link to="/login" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Login</Link>}
                    </div>
                </motion.nav>
    )
}