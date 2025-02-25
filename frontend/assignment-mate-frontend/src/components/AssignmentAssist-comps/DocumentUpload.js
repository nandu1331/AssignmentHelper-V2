import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import ExtractQuestions from './ExtractedQuestions';

const DocumentUpload = () => {
  const [fileName, setFileName] = useState('Select Files');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('Select Files');
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      fileInputRef.current.files = e.dataTransfer.files; // Assign the dropped file to the input
    }
  };

  const handleCancel = () => {
    setFileName('Select Files');
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showToast = (message, type) => {
    toast(message, {
      type,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showToast("Please select a file first!", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const response = await axios.post('http://localhost:8000/api/assignment-assist/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setIsUploading(false);
      setUploadSuccess(true);
      showToast("File uploaded successfully! Extracting Questions from the document.....", "success");

      if (response.data && response.data.id) {
        await handleExtractQuestions(response.data.id);
      } else {
        showToast("Upload successful, but no document ID received.", "warning");
      }
    } catch (error) {
      setIsUploading(false);
      setUploadSuccess(false);
      showToast(error.response?.data?.message || "Error uploading file", "error");
    }
  };

  const handleExtractQuestions = async (documentId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/assignment-assist/documents/${documentId}/extract_questions/`
      );
      const extractedQuestions = response?.data
      setTimeout(() => {
        navigate(`/assignment-assist/extracted-questions/${documentId}`, { state: { questions: extractedQuestions } })
      }, 3000);

      console.log('Extracted Questions:', response);
    } catch (error) {
      console.error('Error extracting questions:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="media-upload bg-card-bg p-6 rounded-xl shadow-xl relative max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <motion.div
          className="media-upload-container flex flex-col items-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h3 className="text-white text-2xl mb-4 font-serif-Roboto">Media Upload</h3>
          <p className="text-gray-400 mb-6">Drag and drop a file or click "Browse"</p>

          <form method="post" encType="multipart/form-data">
            <div className="upload-area border-2 border-dashed border-indigo-500 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-700 transition duration-500 ease-in-out transform hover:scale-105" onClick={handleBrowseClick}>
              <div
                className="bg-contain bg-no-repeat mb-4 h-16 w-16"
                style={{ backgroundImage: "url('/Images/files.png')" }}
              />

              <p className="upload-text text-white mb-4">Drag a file here or click to browse</p>
              <p id="file-name-display" className="text-center text-gray-400">{fileName}</p>

              <input
                type="file"
                name="pdf_file"
                id="file-input"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <button
                className="browse-button bg-white text-indigo-600 px-4 py-2 rounded-lg cursor-pointer mt-4 hover:bg-indigo-300 transition duration-300"
                
              >
                Browse
              </button>
            </div>

            {isUploading && (
              <div className="w-full mt-4 flex justify-center items-center">
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                  color="inherit"
                  size={50}
                />
                <p className="text-white ml-4">{`Uploading: ${uploadProgress}%`}</p>
              </div>
            )}

            <ToastContainer />

            <div className="mt-6 flex justify-between px-2">
              <motion.button
                type="button"
                className={`upload-button bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition duration-300 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={handleUpload}
                disabled={isUploading}
                whileHover={{ scale: 1.1, backgroundColor: "#4c1d95" }}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </motion.button>

              <motion.button
                type="button"
                className="cancel-button bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                onClick={handleCancel}
                whileHover={{ scale: 1.1, backgroundColor: "#cccccc" }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
