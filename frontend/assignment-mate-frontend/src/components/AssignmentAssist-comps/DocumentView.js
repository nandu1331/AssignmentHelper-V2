import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../savedFiles.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/assignment-assist/documents/');
        setDocuments(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      setSelectedFile(documents[0]);
    }
  }, [documents]);

  const handleRowClick = (file) => {
    setSelectedFile(file);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="no-files-message">{error}</div>;
  }

  return (
    <div className="main-container">
      {documents.length > 0 ? (
        <div className="sub-container">
          <div className="file-list">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th>File Name</th>
                  <th>Uploaded At</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {documents.map((file) => (
                  <tr
                    key={file.id}
                    className={`file-row ${selectedFile?.id === file.id ? 'selected' : ''}`}
                    onClick={() => handleRowClick(file)}
                  >
                    <td>{file.name}</td>
                    <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="file-details">
            <div
              className="file-preview-img"
              style={{ backgroundImage: selectedFile?.preview ? `url(${selectedFile.preview})` : 'none' }}
            />
            <div className="file-details-and-edit">
              <div className="file-text-details">
                {selectedFile && (
                  <>
                    <div className="file-detail-row">
                      <span className="file-detail-label">File Name :</span>
                      <span className="file-detail-value">{selectedFile.name}</span>
                    </div>
                    <div className="file-detail-row">
                      <span className="file-detail-label">Uploaded At :</span>
                      <span className="file-detail-value">{new Date(selectedFile.uploaded_at).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="button-container">
                <a href={`/edit_file_details/${selectedFile?.id}`} className="edit-button">Edit</a>
                <a href={`${selectedFile?.id}/viewAnswers`} className="edit-button">View</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-files-message">No files here to display. Start uploading files!</div>
      )}
    </div>
  );
};

export default DocumentList;
