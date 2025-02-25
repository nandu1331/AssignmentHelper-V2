import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExtractQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [editedQuestions, setEditedQuestions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAnswers, setIsGeneratingAnswers] = useState(false);
  const { documentId } = useParams();
  const location = useLocation();
  const passedQuestions = location.state?.questions || [];

  useEffect(() => {
    setQuestions(passedQuestions);
    setEditedQuestions({});
  }, [documentId, passedQuestions]);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleQuestionChange = (id, newText) => {
    setEditedQuestions((prevEditedQuestions) => ({
      ...prevEditedQuestions,
      [id]: newText,
    }));
  };

  const saveQuestions = async () => {
    try {
      const questionsToSave = Object.keys(editedQuestions).map((id) => ({
        id: parseInt(id),
        text: editedQuestions[id],
      }));

      if (questionsToSave.length === 0) {
        showToast('No changes detected to save.', 'info');
        return;
      }

      const response = await axios.patch(
        `http://localhost:8000/api/assignment-assist/documents/${documentId}/update_questions/`,
        questionsToSave
      );

      if (response.status === 200) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => {
            if (editedQuestions[q.id]) {
              return { ...q, text: editedQuestions[q.id] };
            }
            return q;
          })
        );
        setEditedQuestions({});
        showToast('Questions saved successfully!', 'success');
      } else {
        throw new Error(response.data?.error || 'Failed to save questions');
      }
    } catch (error) {
      showToast(`Error occurred: ${error.message}`, 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const showToast = (message, type) => {
    toast(message, {
      type,
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const generateAnswers = async () => {
    setIsGeneratingAnswers(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/assignment-assist/documents/${documentId}/questions/answers/`,
        { questions: questions.map((q) => ({ id: q.id, text: q.text })), answer_detailing: 'medium' }
      );

      if (response.status === 200) {
        const updatedQuestions = questions.map((q) => ({
          ...q,
          answer: response.data.answers[q.id] || 'Answer not generated.',
        }));
        setQuestions(updatedQuestions);
        showToast('Answers generated successfully!', 'success');
      } else {
        throw new Error(response.data?.error || 'Failed to generate answers.');
      }
    } catch (error) {
      showToast(`Error while generating answers: ${error.message}`, 'error');
    } finally {
      setIsGeneratingAnswers(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white">
      <motion.div
        className="container mx-auto p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="question-container bg-gray-800 bg-opacity-75 p-8 rounded-lg shadow-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center text-xl font-bold bg-indigo-600 py-2 px-4 rounded-lg">
            Extracted Questions
          </h2>
          <ul className="mt-4 space-y-3 overflow-y-auto max-h-96">
            {questions.map((question) => (
              <motion.li
                key={question.id}
                className="p-2 rounded-lg bg-gray-700 border border-indigo-500"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onInput={(e) => handleQuestionChange(question.id, e.target.textContent)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: questions.indexOf(question) * 0.1 }}
              >
                {question.text}
                {question.answer && (
                  <p className="mt-2 text-green-400 text-sm">Answer: {question.answer}</p>
                )}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="flex flex-col justify-center items-center gap-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="button bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            onClick={() => (isEditing ? saveQuestions() : toggleEditing())}
          >
            {isEditing ? 'Save Questions' : 'Edit Questions'}
          </motion.button>
          <motion.button
            className="button bg-green-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            onClick={generateAnswers}
            disabled={isGeneratingAnswers}
          >
            {isGeneratingAnswers ? 'Generating...' : 'Generate Answers'}
          </motion.button>
          <motion.a
            href="/assignment-assist/uploadPDF"
            className="button bg-gray-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Upload Another PDF
          </motion.a>
        </motion.div>
        <ToastContainer />
      </motion.div>
    </div>
  );
};

export default ExtractQuestions;
