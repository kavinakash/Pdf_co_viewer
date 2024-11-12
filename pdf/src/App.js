import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import UploadPDF from './UploadPDF';
import PDFViewer from './PDFViewer';
import { useSearchParams } from 'react-router-dom';
import './App.css';


const socket = io('http://localhost:5000');

function App() {
    const [pdfUrl, setPdfUrl] = useState('');
    const [sessionLink, setSessionLink] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const isLocalhost = window.location.hostname === 'localhost';

    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        if (sessionId) {
            socket.emit('join-session', sessionId);
        }
    }, [searchParams]);

    const handleFileSelect = (fileUrl) => {
        setPdfUrl(fileUrl);
        socket.emit('create-session', fileUrl);
    };

    useEffect(() => {
        socket.on('session-created', ({ sessionId }) => {
            setSessionLink(`http://localhost:3000?sessionId=${sessionId}`);
        });

        socket.on('session-joined', ({ pdfUrl, currentPage }) => {
            setPdfUrl(pdfUrl);
            setCurrentPage(currentPage);
        });

        socket.on('page-update', (pageNumber) => {
            setCurrentPage(pageNumber);
        });

        return () => {
            socket.off('session-created');
            socket.off('session-joined');
            socket.off('page-update');
        };
    }, []);

    return (
        <div className="App">
            <h1>PDF Co-Viewing App</h1>
            {isLocalhost && (
                <div className="upload-section">
                    <UploadPDF onFileSelect={handleFileSelect} />
                    {sessionLink && (
                        <div className="session-link">
                            <p>Share this link with viewers:</p>
                            <a href={sessionLink}>{sessionLink}</a>
                        </div>
                    )}
                </div>
            )}
            {pdfUrl && <PDFViewer fileUrl={pdfUrl} currentPage={currentPage} />}
        </div>
    );
}

export default App;
