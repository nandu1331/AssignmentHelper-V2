import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizResults = () => {
    const { quizId, attemptId } = useParams(); // Get both quizId and attemptId
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const response = await axios.get(`/api/quiz/results/${quizId}/${attemptId}`);
                setAttempt(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempt();
    }, [quizId, attemptId]);

    if (loading) {
        return <div className="text-white text-center text-2xl mt-8">Loading results...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl mt-8">Error: {error.message}</div>;
    }

    if (!attempt) {
        return <div className="text-white text-center text-2xl mt-8">Attempt not found.</div>;
    }

    return (
        <motion.div
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="bg-gradient-to-r from-primary to-secondary text-white text-center p-6 rounded-lg mb-8 shadow-md">
                <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                <div className="text-4xl font-semibold">{attempt.score}%</div>
                <div className="text-lg opacity-80">Time taken: {attempt.time_taken} seconds</div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Review Incorrect Answers</h2>
                {attempt.incorrect_questions && attempt.incorrect_questions.length > 0 ? (
                    attempt.incorrect_questions.map((question, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-800 p-6 rounded-lg mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-white font-medium mb-2">{question.question}</div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="p-3 rounded-md bg-red-800 bg-opacity-30 border border-error text-white">
                                    Your answer: {question.selectedOption}
                                </div>
                                <div className="p-3 rounded-md bg-green-800 bg-opacity-30 border border-success text-white">
                                    Correct answer: {question.correctOption}
                                </div>
                            </div>
                            {question.explanation && (
                                <div className="mt-4 p-3 rounded-md bg-purple-900 bg-opacity-30 text-white">
                                    <strong>Explanation:</strong> {question.explanation}
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <p className="text-white text-center">You answered all questions correctly!</p>
                )}
            </div>

            <div className="flex justify-center space-x-4">
                <Link to="/quiz/history" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    View Quiz History
                </Link>
                <Link to="/quizzes" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Try Another Quiz
                </Link>
            </div>
        </motion.div>
    );
};

export default QuizResults;