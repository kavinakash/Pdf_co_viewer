import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:5000');
const socket = io('https://test-q2ax.onrender.com');

const PDFViewer = ({ fileUrl, currentPage, onPageChange }) => {
    const [searchParams] = useSearchParams();
    const [totalPages, setTotalPages] = useState(1);
    const isViewer = searchParams.get('sessionId') !== null;
    const sessionId = searchParams.get('sessionId');
    const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `https://test-q2ax.onrender.com${fileUrl}`;

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    useEffect(() => {
        if (isViewer && currentPage) {
            setTimeout(() => {
                jumpToPage(currentPage - 1);
            }, 100);
        }
    }, [currentPage, isViewer, jumpToPage]);

    const handlePreviousPage = () => {
        const newPage = currentPage - 1;
        if (newPage >= 1) {
            jumpToPage(newPage - 1);
            onPageChange(newPage);
            if (!isViewer && sessionId) {
                socket.emit('page-change', { sessionId, pageNumber: newPage });
            }
        }
    };

    const handleNextPage = () => {
        const newPage = currentPage + 1;
        if (newPage <= totalPages) {
            jumpToPage(newPage - 1);
            onPageChange(newPage);
            if (!isViewer && sessionId) {
                socket.emit('page-change', { sessionId, pageNumber: newPage });
            }
        }
    };

    return (
        <div className={`pdf-viewer-container ${isViewer ? 'viewer-mode' : ''}`}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div style={{ height: '70vh', width: '100%' }}>
                    <Viewer
                        fileUrl={fullUrl}
                        defaultScale={1}
                        initialPage={currentPage - 1}
                        plugins={[pageNavigationPluginInstance]}
                        onDocumentLoad={(e) => {
                            setTotalPages(e.doc.numPages);
                        }}
                    />
                </div>
            </Worker>
            {!isViewer && (
                <div className="navigation-buttons">
                    <button 
                        onClick={handlePreviousPage}
                        disabled={currentPage <= 1}
                        className="nav-button"
                        type="button"
                    >
                        Previous
                    </button>
                    <span className="page-indicator">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="nav-button"
                        type="button"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
