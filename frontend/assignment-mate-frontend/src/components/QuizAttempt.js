import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizAttempt = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);

    useEffect(() => {
        const initializeQuiz = async () => {
            try {

                // If no existing attempt, start a new one
                const startResponse = await axios.get(`/api/quiz/start/${quizId}/`);
                setAttemptId(startResponse.data.id);
                setQuiz(startResponse.data.quiz);

                if (startResponse.data.completed_at) {
                    navigate(`/quiz/results/${quizId}/${startResponse.data.id}`);
                }

            } catch (err) {
                setError(err);
                if (err.response?.status === 404) {
                    navigate('/quizzes')
                }
            } finally {
                setLoading(false);
            }
        };

        initializeQuiz();
    }, [quizId, navigate]);

    const handleOptionSelect = (questionIndex, optionIndex) => {
        setSelectedOptions({ ...selectedOptions, [questionIndex]: optionIndex });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!attemptId) {
            setError(new Error('Missing attempt ID. Please refresh the page.'));
            return;
        }

        try {
            await axios.post(`/api/quiz/submit/${attemptId}/`, {
                answers: Object.entries(selectedOptions).map(([questionIndex, selectedOption]) => ({
                    questionIndex: parseInt(questionIndex),
                    selectedOption: parseInt(selectedOption),
                })),
            });
            navigate(`/quiz/results/${quizId}/${attemptId}`);
        } catch (err) {
            setError(err);
            alert("Failed to submit quiz. Please try again.");
        }
    };

    if (loading) {
        return <div className="text-white text-center text-2xl mt-8">Loading quiz...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl mt-8">Error: {error.message}</div>;
    }

    if (!quiz) {
        return <div className="text-white text-center text-2xl mt-8">Quiz not found or is inactive.</div>
    }

    const progress = (Object.keys(selectedOptions).length / quiz.questions.length) * 100;

    return (
        <motion.div
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="progress-bar bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
                <div className="progress-fill bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <form onSubmit={handleSubmit}>
                {quiz.questions.map((question, questionIndex) => (
                    <motion.div
                        key={question.id}
                        className="bg-gray-800 p-6 rounded-lg mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: questionIndex * 0.1 }}
                    >
                        <h3 className="text-xl font-semibold text-white mb-2">Question {questionIndex + 1}</h3>
                        <p className="text-white mb-4">{question.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option, optionIndex) => (
                                <motion.div
                                    key={optionIndex}
                                    className={`p-3 rounded-md cursor-pointer transition duration-300 ${selectedOptions[questionIndex] === optionIndex ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    onClick={() => handleOptionSelect(questionIndex, optionIndex)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="text-white">{option}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
                {attemptId ? (
                    <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                        Submit Quiz
                    </button>
                ) : (
                    <div className="text-red-500 text-center text-xl mt-4">No attempt created. Please refresh the page to start a new attempt.</div>
                )}
            </form>
        </motion.div>
    );
};

export default QuizAttempt;