import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const Encryption = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [isInitialized, setIsInitialized] = useState(false);

    // Read URL parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode');
        const urlText = params.get('text');

        if (urlMode && (urlMode === 'encrypt' || urlMode === 'decrypt')) {
            setMode(urlMode as 'encrypt' | 'decrypt');
        }
        if (urlText) {
            setInput(urlText);
        }
        setIsInitialized(true);
    }, []);

    // Update URL only when user manually changes mode or input
    const updateUrlParams = (newMode: string, newInput: string) => {
        if (!isInitialized) return;
        const params = new URLSearchParams();
        if (newMode) params.set('mode', newMode);
        if (newInput) params.set('text', encodeURIComponent(newInput));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInput = e.target.value;
        setInput(newInput);
        updateUrlParams(mode, newInput);
    };

    const handleModeChange = (newMode: 'encrypt' | 'decrypt') => {
        setMode(newMode);
        setInput('');
        setOutput('');
        updateUrlParams(newMode, '');
    };

    const handleEncrypt = () => {
        if (!input || !password) {
            setOutput('Please enter both text and password');
            return;
        }
        try {
            const encrypted = CryptoJS.AES.encrypt(input, password).toString();
            setOutput(encrypted);
        } catch (error) {
            setOutput('Encryption failed. Please try again.');
        }
    };

    const handleDecrypt = () => {
        if (!input || !password) {
            setOutput('Please enter both encrypted text and password');
            return;
        }
        try {
            const decrypted = CryptoJS.AES.decrypt(input, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted) {
                setOutput('Incorrect password or invalid encrypted text');
                return;
            }
            setOutput(decrypted);
        } catch (error) {
            setOutput('Decryption failed. Please check your password and input.');
        }
    };

    return (
        <div className="encryption-container">
            <h1>Quick Encrypt/Decrypt</h1>
            <div className="mode-selector">
                <button 
                    onClick={() => handleModeChange('encrypt')}
                    className={mode === 'encrypt' ? 'active' : ''}
                >
                    Encrypt
                </button>
                <button 
                    onClick={() => handleModeChange('decrypt')}
                    className={mode === 'decrypt' ? 'active' : ''}
                >
                    Decrypt
                </button>
            </div>
            <div className="input-group">
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="password-input"
                    />
                </label>
            </div>
            <div className="input-group">
                <label>
                    {mode === 'encrypt' ? 'Text to encrypt:' : 'Encrypted text:'}
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder={mode === 'encrypt' ? 'Enter text to encrypt' : 'Enter encrypted text'}
                    />
                </label>
            </div>
            <button 
                onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
                className="process-button"
                disabled={!input || !password}
            >
                {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
            <div className="output">
                <h3>Result:</h3>
                <textarea value={output} readOnly />
            </div>
        </div>
    );
};

export default Encryption; 