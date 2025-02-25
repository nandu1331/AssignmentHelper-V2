import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [numOfQuestions, setNumOfQuestions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/quiz/generate/', { topic, context, difficulty, numOfQuestions });
            const quizId = response.data.id;
            navigate(`/quiz/attempt/${quizId}`);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate quiz. Please try again.");
            console.error("Quiz generation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut"}}
            className='quiz-container'
        >
            <motion.div
                className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10 max-w-[50%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Quiz Generator</h1>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="topic" className="block text-white font-medium mb-2">Quiz Topic</label>
                        <input
                            type="text"
                            id="topic"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div className='flex gap-20 mb-6'>
                        <div className='relative'>
                            <label htmlFor='difficulty' className='block text-white font-medium mb-2'>Difficulty</label>
                            <select
                                id="difficulty"
                                className="w-36 px-4 py-2 rounded-lg bg-gray-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition duration-800 ease-in-out" 
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 top-8 flex items-center px-2 text-gray-400"> 
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                        <div>
                            <label htmlFor='numOfQuestions' className='block text-white font-medium mb-2'>Number Of Questions</label>
                            <input
                                type="number"
                                id="numOfQuestions"
                                className="w-36 px-4 py-2 rounded-lg bg-gray-700 text-white focus
                                :outline-none focus:ring-2 focus:ring-primary"
                                value={numOfQuestions}
                                onChange={(e) => setNumOfQuestions(e.target.valueAsNumber)}
                                required
                                min={1}
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="context" className="block text-white font-medium mb-2">Additional Context (Optional)</label>
                        <textarea
                            id="context"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Generating Quiz...' : 'Generate Quiz'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default QuizGenerator;