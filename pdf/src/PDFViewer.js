import React, { useEffect, useState } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFViewer = ({ fileUrl, currentPage }) => {
    const [pageIndex, setPageIndex] = useState(currentPage - 1); // Zero-based index
    const fullUrl = `http://localhost:5000${fileUrl}`;

    useEffect(() => {
        setPageIndex(currentPage - 1);
    }, [currentPage]);

    const handlePreviousPage = () => {
        setPageIndex((prevPage) => Math.max(prevPage - 1, 0));
    };

    const handleNextPage = () => {
        setPageIndex((prevPage) => prevPage + 1);
    };

    return (
        <div className="pdf-viewer-container">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                <Viewer
                    fileUrl={fullUrl}
                    defaultPageIndex={pageIndex} // Show only one page at a time
                    zoom={SpecialZoomLevel.PageFit} // Fit page to container width
                    key={pageIndex} // Force re-render on page change
                    style={{ maxWidth: '100%', maxHeight: '100vh' }}
                />
            </Worker>
            <div className="navigation-buttons">
                <button onClick={handlePreviousPage} disabled={pageIndex === 0}>
                    Previous
                </button>
                <button onClick={handleNextPage}>Next</button>
            </div>
        </div>
    );
};

export default PDFViewer;
