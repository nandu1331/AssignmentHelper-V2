import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizHistory = () => {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`/api/quiz/history/?page=${currentPage}`);
                setHistory(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentPage]);

    const getScoreBadgeClass = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div className="text-white text-center text-2xl mt-8">Loading quiz history...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-2xl mt-8">Error: {error.message}</div>;
    }

    if (!history || !history.results) { // Check if history or history.results is null/undefined
        return <div className="text-white text-center text-2xl mt-8">No quiz history found.</div>;
    }

    const { results, statistics, count, next, previous } = history.results;
    const numPages = Math.ceil(count / 10); // Assuming 10 items per page

    return (
        <motion.div
            className="container mx-auto p-8 bg-card-bg rounded-lg shadow-lg mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Your Quiz Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <div className="text-2xl font-bold text-primary">{statistics.total_attempts || 0}</div>
                    <div className="text-white">Total Attempts</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <div className="text-2xl font-bold text-primary">
                        {statistics.average_score ? statistics.average_score.toFixed(1) : 0}%
                    </div>
                    <div className="text-white">Average Score</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <div className="text-2xl font-bold text-primary">
                        {statistics.highest_score ? statistics.highest_score.toFixed(1) : 0}%
                    </div>
                    <div className="text-white">Highest Score</div>
                </div>
            </div>

            <h1 className='text-3xl font-bold text-center py-5'>Quiz Attempts</h1>
            <div className="space-y-4">
                {results.map((attempt) => (
                    <motion.div
                        key={attempt.id}
                        className="bg-gray-800 p-6 rounded-lg shadow-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-primary mb-2">{attempt.quiz.title}</h2>
                        <div className="flex items-center mb-2">
                            <span className="text-white mr-2">Score:</span>
                            <span className={`px-2 py-1 rounded-md text-white font-bold ${getScoreBadgeClass(attempt.score)}`}>
                                {attempt.score.toFixed(1)}%
                            </span>
                        </div>
                        <div className="text-white mb-4">Date: {new Date(attempt.completed_at).toLocaleDateString()}</div>
                        <div className="flex space-x-4">
                            <Link to={`/quiz/results/${attempt.quiz.id}/${attempt.id}`} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">View Results</Link>
                            <Link to={`/quiz/attempt/${attempt.quiz.id}`} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">Retake Quiz</Link>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            {numPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    {previous && (
                        <button onClick={() => handlePageChange(currentPage - 1)} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                    )}
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`py-2 px-4 rounded ${currentPage === pageNumber ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    {next && (
                        <button onClick={() => handlePageChange(currentPage + 1)} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default QuizHistory;