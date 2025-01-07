import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/quiz/generate/', { topic, context });
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
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
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
    );
};

export default QuizGenerator;