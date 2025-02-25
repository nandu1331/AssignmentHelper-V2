import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // For accessing the documentId from the URL
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ViewAnswers = () => {
    const { documentId } = useParams(); // Extract documentId from URL
    const [questions, setQuestions] = useState([]);
    const [openAnswers, setOpenAnswers] = useState({});
    const [loading, setLoading] = useState(false); // For "Generate All Answers" button
    const answerRefs = useRef({});

    useEffect(() => {
        // Fetch saved questions and answers for the document when the component mounts
        const fetchAnswers = async () => {
            try {
                const response = await axios.get(`/api/assignment-assist/documents/${documentId}/questions/answers/`);
                if (response.status === 200) {
                    setQuestions(response.data.responses || []);
                    console.log(documentId + "fetched answers")
                } else {
                    throw new Error('Failed to fetch answers.');
                }
            } catch (error) {
                console.error('Error fetching answers:', error);
                alert('Error fetching answers: ' + error.message);
            }
        };

        fetchAnswers();
    }, [documentId]);
     
    const regenerateAnswer = async (q) => {
        try {
            const response = await axios.post(`/api/assignment-assist/documents/${documentId}/questions/${q.question_id}/answer/`, {question: [{
                    id: q.question_id,
                    text: q.question
                }], answer_detailing: 'medium'});
            if (response.status === 200) {
                // Update the answer in the state
                setQuestions(prevQuestions => 
                    prevQuestions.map(ques => 
                        ques.question_id === q.question_id ? { ...q, answer: response.data.answer } : q
                    )
                );
            }
        } catch (error) {
            console.error('Error regenerating answer:', error);
            alert('Error regenerating answer: ' + (error.response?.data?.message || error.message));
        }
    };

    const toggleAnswer = (questionId) => {
        setOpenAnswers((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 rounded-lg w-11/12 mx-auto mt-8 space-y-6"
        >
            <h2 className="text-white text-2xl font-semibold mb-4 text-center">Document {documentId}</h2>
            <button
                className={`bg-purple-900 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mx-auto block ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => alert('This button can be linked to a future feature.')}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Feature Coming Soon'}
            </button>
            {questions.length > 0 ? (
                questions.map((q) => (
                    <motion.div
                        variants={itemVariants}
                        key={q.question_id}
                        className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-lg shadow-md overflow-hidden"
                    >
                        <div
                            className="p-4 text-white font-bold cursor-pointer flex justify-between items-center relative hover:scale-[101%] transition-transform duration-300"
                            onClick={() => toggleAnswer(q.question_id)}
                        >
                            {q.question}
                            <i
                                className={`fas fa-caret-down transition-transform duration-300 ${
                                    openAnswers[q.question_id] ? 'rotate-90' : ''
                                }`}
                            ></i>
                        </div>
                        <AnimatePresence>
                            {openAnswers[q.question_id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 bg-gray-800 text-gray-200"
                                    ref={(el) => (answerRefs.current[q.question_id] = el)}
                                >
                                    {q.answer ? (
                                        <div dangerouslySetInnerHTML={{ __html: q.answer }} />
                                    ) : (
                                        <p className="text-gray-400">No answer available.</p>
                                    )}

                                    <button 
                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                        onClick={() => regenerateAnswer(q)}
                                    >
                                        Regenerate Answer
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))
            ) : (
                <p className="text-white text-center">No questions and answers found.</p>
            )}
        </motion.div>
    );
};

export default ViewAnswers;
