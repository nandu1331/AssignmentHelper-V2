import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const AttemptsList = () => {
    const { quizId } = useParams();
    const [attempts, setAttempts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await axios.get(`/api/quiz/results/${quizId}/`);
                setAttempts(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, [quizId]);

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-white text-center text-2xl mt-8">Loading attempts...</div>
            </motion.div>
        );
    }

    if (error) {
        console.error("Error fetching attempts:", error); // Log the error for debugging
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-red-500 text-center text-2xl mt-8">Error: Could not load attempts.</div> {/* User-friendly message */}
            </motion.div>
        );
    }

    if (!attempts || attempts.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-white text-center text-xl mt-8 p-6 bg-gray-800 rounded-lg"> {/* Improved styling */}
                    <p className="mb-4">No attempts found for this quiz yet. Ready to try?</p>
                    <Link to={`/quiz/attempt/${quizId}`} className="inline-block bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        Take Quiz
                    </Link>
                </div>
            </motion.div>
        );
    }

    const listVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1, // Reduced stagger for a faster feel
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 }, // Added scale for a subtle effect
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Quiz Attempts</h1>
            <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                {attempts.map((attempt) => (
                    <motion.li
                        key={attempt.id}
                        className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition duration-300 shadow-md"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }} // Added hover scale
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <Link to={`/quiz/results/${quizId}/${attempt.id}`} className="text-white font-medium hover:text-primary transition duration-300"> {/* Improved hover color */}
                                    Attempt {attempt.id} - Score: {attempt.score}%
                                </Link>
                            </div>
                            <div className="text-gray-400 text-sm">
                                {format(new Date(attempt.completed_at), 'MMM dd, yyyy h:mm a')} {/* More complete date format */}
                            </div>
                        </div>
                    </motion.li>
                ))}
            </motion.ul>
        </motion.div>
    );
};

export default AttemptsList;