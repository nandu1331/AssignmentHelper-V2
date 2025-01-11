import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';

const QuizAttempt = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const progressBarControls = useAnimation();
    const timerRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const initializeQuiz = async () => {
            try {
                const startResponse = await axios.get(`/api/quiz/start/${quizId}/`);
                setAttemptId(startResponse.data.id);
                setQuiz(startResponse.data.quiz);

                if (startResponse.data.completed_at) {
                    navigate(`/quiz/results/${quizId}/${startResponse.data.id}`);
                    return;
                }

                // Dynamically set time limit based on the number of questions
                const numberOfQuestions = startResponse.data.quiz.questions.length;
                const dynamicTimeLimit = numberOfQuestions; // 1 minute per question
                const totalTime = dynamicTimeLimit * 60; // Fallback mechanism

                setTimeLeft(totalTime);
            } catch (err) {
                setError(err);
                if (err.response?.status === 404) {
                    navigate('/quizzes');
                }
            } finally {
                setLoading(false);
            }
        };

        initializeQuiz();

        return () => clearInterval(timerRef.current);
    }, [quizId, navigate]);

    useEffect(() => {
        const handleScroll = () => {
            const containerTop = document.querySelector(".quiz-container")?.getBoundingClientRect().top;
            setIsSticky(containerTop <= 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            handleSubmit();
        }
        if (timeLeft !== null && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    };

    const handleOptionSelect = (questionIndex, optionIndex) => {
        setSelectedOptions(prevOptions => {
            const newOptions = { ...prevOptions };
            if (newOptions[questionIndex] === optionIndex) {
                delete newOptions[questionIndex];
            } else {
                newOptions[questionIndex] = optionIndex;
            }
            return newOptions;
        });
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

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
            celebrateCompletion()
        } catch (err) {
            setError(err);
            alert("Failed to submit quiz. Please try again.");
        }
    };

    const celebrateCompletion = () => {
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    if (loading) {
        return <div className="text-white text-center text-2xl mt-8">Loading quiz...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl mt-8">Error: {error.message}</div>;
    }

    if (!quiz) {
        return <div className="text-white text-center text-2xl mt-8">Quiz not found or is inactive.</div>;
    }

    const progress = (Object.keys(selectedOptions).length / quiz.questions.length) * 100;

    // Circular timer progress calculation
    const progressPercent = (timeLeft / (quiz.questions.length * 60)) * 100;

    return (
        <div className="relative">
            {/* Circular Timer Progress Bar */}
            <div className="relative w-32 h-32 mx-auto mt-4">
                <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 36 36"
                >
                    <path
                        className="stroke-gray-300"
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                        fill="none"
                        strokeWidth="2"
                    />
                    <motion.path
                        className="stroke-primary" // Apply primary stroke color
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                        fill="none"
                        strokeWidth="2"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progressPercent}
                        animate={{ strokeDashoffset: 100 - progressPercent }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Quiz Container */}
            <motion.div
                className="quiz-container container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl text-center font-bold py-5">{quiz.title}</h1>
                {/* Progress Bar for Questions */}
                <motion.div
                    className={`h-2 z-50 bg-gray-200 ${isSticky ? "fixed top-0 left-0 w-full" : "absolute w-full left-1/2 transform -translate-x-1/2"}`}
                    animate={progressBarControls}
                    initial={{
                        transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
                    }}
                >
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                    />
                </motion.div>
                <form onSubmit={handleSubmit}>
                    {quiz.questions.map((question, questionIndex) => (
                        <motion.div
                            key={question.id}
                            className="bg-gray-800 p-6 rounded-lg mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: questionIndex * 0.1 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Question {questionIndex + 1}
                            </h3>
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
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <div className="text-red-500 text-center text-xl mt-4">
                            No attempt created. Please refresh the page to start a new attempt.
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default QuizAttempt;
