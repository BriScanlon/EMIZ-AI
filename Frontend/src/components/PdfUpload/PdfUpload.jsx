import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import "./PdfUpload.scss";

const PdfUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = React.useRef();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    validateAndSetFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    validateAndSetFiles(files);
  };

  const validateAndSetFiles = (files) => {
    const validFiles = files.filter((file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setError("Some files were invalid or exceeded 5MB size limit.");
    } else {
      setError("");
    }
    setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = (file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    
    fetch("http://localhost:8085/documents", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          alert(`${file.name} uploaded successfully!`);
          handleRemoveFile(index);
        } else {
          setError(`Failed to upload ${file.name}. Please try again.`);
        }
      })
      .catch(() => setError(`Network error while uploading ${file.name}. Please try again.`));
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="pdf-upload">
      {uploadedFiles.length === 0 ? (
        <div
          className="upload-zone"
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FiUploadCloud className="upload-icon" />
          <p className="upload-instructions">Drag & drop PDF files here, or click to select files.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="file-input"
            multiple
          />
        </div>
      ) : (
        <>
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <button onClick={() => handleUpload(file, index)} className="upload-btn">Upload</button>
                <button onClick={() => handleRemoveFile(index)} className="remove-btn">Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={openFileDialog} className="add-more-btn">Add More Files</button>
        </>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PdfUpload;
