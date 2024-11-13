import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './App.css';
import PDFViewer from './PDFViewer';
import UploadPDF from './UploadPDF';

const socket = io('https://test-q2ax.onrender.com');

function App() {
    const [pdfUrl, setPdfUrl] = useState('');
    const [sessionLink, setSessionLink] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [copyStatus, setCopyStatus] = useState('');
    const [searchParams] = useSearchParams();
    const isViewer = searchParams.get('sessionId') !== null;

    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        if (sessionId) {
            socket.emit('join-session', sessionId);
        }

        socket.on('session-created', ({ sessionId }) => {
            const link = `${window.location.origin}?sessionId=${sessionId}`;
            setSessionLink(link);
        });

        socket.on('session-joined', ({ pdfUrl, currentPage }) => {
            setPdfUrl(pdfUrl);
            setCurrentPage(currentPage);
        });

        if (isViewer) {
            socket.on('page-update', (updatedPageNumber) => {
                console.log('Viewer received page update:', updatedPageNumber);
                setCurrentPage(updatedPageNumber);
            });
        }

        return () => {
            socket.off('session-created');
            socket.off('session-joined');
            socket.off('page-update');
        };
    }, [isViewer, searchParams]);

    const handleFileSelect = (fileUrl) => {
        setPdfUrl(fileUrl);
        socket.emit('create-session', fileUrl);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(sessionLink);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus(''), 2000);
        } catch (err) {
            setCopyStatus('Failed to copy');
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="App">
            <h1>PDF Co-Viewing App</h1>
            {!isViewer && (
                <div className="upload-section">
                    <UploadPDF onFileSelect={handleFileSelect} />
                    {sessionLink && (
                        <div className="session-link">
                            <p>Share this link with viewers:</p>
                            <div className="link-container">
                                <input 
                                    type="text" 
                                    value={sessionLink} 
                                    readOnly 
                                    className="session-link-input"
                                    onClick={(e) => e.target.select()}
                                />
                                <button 
                                    onClick={handleCopyLink}
                                    className="copy-button"
                                >
                                    {copyStatus || 'Copy Link'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {pdfUrl && (
                <PDFViewer 
                    fileUrl={pdfUrl} 
                    currentPage={currentPage}
                    onPageChange={handlePageChange} 
                />
            )}
        </div>
    );
}

export default App;
