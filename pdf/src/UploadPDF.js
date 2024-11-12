import React, { useState } from 'react';
import axios from 'axios';

const UploadPDF = ({ onFileSelect }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                onFileSelect(response.data.fileUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            alert('Please upload a valid PDF file');
        }
    };

    return (
        <div className="upload-container">
            <div className="file-input-wrapper">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="upload-button">
                    Choose PDF File
                </label>
                {selectedFile && (
                    <div className="selected-file">
                        Selected file: {selectedFile.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPDF;
