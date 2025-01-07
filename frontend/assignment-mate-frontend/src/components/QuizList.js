// src/components/QuizList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get('/api/quiz/quizzes/'); // Your DRF endpoint
                setQuizzes(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const navigate = useNavigate();

    const showAttempts = (quizId) => {
        navigate(`/quiz/results/${quizId}`);
    }

    if (loading) {
        return <div>Loading quizzes...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    }

    if (loading) {
        return <div className="text-white text-center text-2xl mt-8">Loading quizzes...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl mt-8">Error: {error.message}</div>;
    }

    return (
        <motion.div
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Available Quizzes</h1>
            <ul className="space-y-4">
                {quizzes.map(quiz => (
                    <motion.li
                        key={quiz.id}
                        className="bg-gray-800 p-4 rounded-md flex justify-between items-center hover:bg-gray-700 transition duration-300"
                        variants={itemVariants}
                    >
                        <a href={`/quiz/attempt/${quiz.id}`} className="text-white hover:text-primary hover:scale-105 transition duration-300 block max-w-fit">
                            {quiz.title}
                        </a>
                        <button 
                            className='p-3 text-md bg-slate-500 hover:bg-slate-800 transition duration-300 rounded-lg'
                            onClick={() => showAttempts(quiz.id)}    
                        >
                            Attempts
                        </button>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default QuizList;