import React, { useState, useEffect } from 'react';
import SliderControl from './SliderControl';
import AddressBar from './AddressBar';
import { calculateBits, formatBytes } from '../utils/cacheMath';
import styles from './BitSlicer.module.css';

const BitSlicer = () => {
    // State 
    // Cache Size: stored as log2 value. 12 = 4KB. Range: 10 (1KB) to 30 (1GB)
    const [cacheSizeLog, setCacheSizeLog] = useState(12);

    // Block Size: stored as log2 value. 6 = 64B. Range: 2 (4B) to 12 (4KB)
    const [blockSizeLog, setBlockSizeLog] = useState(6);

    // Associativity: stored as log2 value. 0 = 1-way (Direct), 1 = 2-way, etc. Range: 0 to 5 (32-way)
    const [associativityLog, setAssociativityLog] = useState(0);
    const [isFullyAssociative, setIsFullyAssociative] = useState(false);

    const [bits, setBits] = useState({ tagBits: 0, indexBits: 0, offsetBits: 0 });

    // Game Mode State
    const [isGameMode, setIsGameMode] = useState(false);
    const [gameTarget, setGameTarget] = useState(null);
    const [guess, setGuess] = useState({ cacheSize: '', blockSize: '', associativity: '', tagArraySize: '' });
    const [feedback, setFeedback] = useState(null);
    const [gameVariant, setGameVariant] = useState(null); // 'FIND_CACHE' | 'FIND_ASSOC'

    // Derived values for calculation
    const currentCacheSize = isGameMode && gameTarget ? gameTarget.cacheSize : Math.pow(2, cacheSizeLog);
    const currentBlockSize = isGameMode && gameTarget ? gameTarget.blockSize : Math.pow(2, blockSizeLog);
    const currentAssociativity = isGameMode && gameTarget ? gameTarget.associativity :
        (isFullyAssociative ? (currentCacheSize / currentBlockSize) : Math.pow(2, associativityLog));

    useEffect(() => {
        setBits(calculateBits(currentCacheSize, currentBlockSize, currentAssociativity, 32));
    }, [currentCacheSize, currentBlockSize, currentAssociativity]);

    // Game Logic
    const startGame = () => {
        // Generate random parameters
        // Cache: 2KB (11) to 64KB (16)
        const rCacheLog = Math.floor(Math.random() * (16 - 11 + 1)) + 11;
        // Block: 16B (4) to 64B (6)
        const rBlockLog = Math.floor(Math.random() * (6 - 4 + 1)) + 4; // 16, 32, 64
        // Assoc: 1 (0) to 4-way (2)
        const rAssocLog = Math.floor(Math.random() * 3); // 0, 1, 2

        const target = {
            cacheSize: Math.pow(2, rCacheLog),
            blockSize: Math.pow(2, rBlockLog),
            associativity: Math.pow(2, rAssocLog)
        };

        setGameTarget(target);
        setIsGameMode(true);
        const variant = Math.random() < 0.5 ? 'FIND_CACHE' : 'FIND_ASSOC';
        setGameVariant(variant);
        setGuess({ cacheSize: '', blockSize: '', associativity: '', tagArraySize: '' });
        setFeedback(null);
    };

    const exitGame = () => {
        setIsGameMode(false);
        setGameTarget(null);
        setFeedback(null);
    };

    const checkSolution = () => {
        if (!gameTarget) return;

        const parseInput = (str) => parseInt(str.replace(/,/g, '')) || 0;

        const gCache = parseInput(guess.cacheSize);
        const gBlock = parseInput(guess.blockSize);
        const gAssoc = parseInput(guess.associativity);
        const gTagArray = parseInput(guess.tagArraySize);

        let correct = true;
        let msg = [];

        if (gameVariant === 'FIND_CACHE') {
            if (gCache !== gameTarget.cacheSize) {
                correct = false;
                msg.push(`Cache Size incorrect.`);
            }
        }

        if (gameVariant === 'FIND_ASSOC') {
            if (gAssoc !== gameTarget.associativity) {
                correct = false;
                msg.push(`Associativity incorrect.`);
            }
        }

        if (gBlock !== gameTarget.blockSize) {
            correct = false;
            msg.push(`Block Size incorrect.`);
        }

        // Tag Array Size Check
        const totalBlocks = gameTarget.cacheSize / gameTarget.blockSize;
        const expectedTagArraySize = totalBlocks * bits.tagBits;
        if (gTagArray !== expectedTagArraySize) {
            correct = false;
            msg.push(`Tag Array Size incorrect.`);
        }

        if (correct) {
            setFeedback({ type: 'success', text: 'Correct! Great job!' });
        } else {
            setFeedback({ type: 'error', text: 'Incorrect. ' + msg.join(' ') });
        }
    };

    // Formatters
    const formatCacheSize = (val) => formatBytes(Math.pow(2, val));
    const formatBlockSize = (val) => `${Math.pow(2, val)} B`;
    const formatAssoc = (val) => {
        const ways = Math.pow(2, val);
        return ways === 1 ? 'Direct' : `${ways}-way`;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Bit Slicer</h1>
                <p className={styles.subtitle}>
                    {isGameMode ? "Reverse Engineer Mode: Deduce parameters from the address breakdown!" : "Visualize how cache parameters affect address mapping."}
                </p>
                <button
                    className={isGameMode ? styles.modeParamsBtn : styles.modeGameBtn}
                    onClick={isGameMode ? exitGame : startGame}
                >
                    {isGameMode ? "Exit Game Mode" : "Start Reverse Engineer Mode"}
                </button>
            </header>

            <div className={styles.card}>
                <AddressBar
                    tagBits={bits.tagBits}
                    indexBits={bits.indexBits}
                    offsetBits={bits.offsetBits}
                />

                {!isGameMode ? (
                    <div className={styles.controls}>
                        <SliderControl
                            label="Cache Size"
                            value={cacheSizeLog}
                            min={10}
                            max={24}
                            step={1}
                            onChange={setCacheSizeLog}
                            formatValue={formatCacheSize}
                            footer={
                                <button className={styles.defaultBtn} onClick={() => setCacheSizeLog(12)}>
                                    Default (4 KB)
                                </button>
                            }
                        />

                        <SliderControl
                            label="Block Size"
                            value={blockSizeLog}
                            min={2}
                            max={10}
                            step={1}
                            onChange={setBlockSizeLog}
                            formatValue={formatBlockSize}
                            footer={
                                <button className={styles.defaultBtn} onClick={() => setBlockSizeLog(5)}>
                                    Default (32 B)
                                </button>
                            }
                        />

                        <SliderControl
                            label="Associativity"
                            value={associativityLog}
                            min={0}
                            max={5}
                            step={1}
                            onChange={setAssociativityLog}
                            formatValue={isFullyAssociative ? () => 'Full' : formatAssoc}
                            disabled={isFullyAssociative}
                            footer={
                                <label className={styles.toggleLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isFullyAssociative}
                                        onChange={(e) => setIsFullyAssociative(e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    <div className={styles.switch}></div>
                                    Fully Assoc.
                                </label>
                            }
                        />
                    </div>
                ) : (
                    <div className={styles.gameControls}>
                        {gameVariant === 'FIND_CACHE' ? (
                            <div className={styles.inputGroup}>
                                <label>Cache Size (Bytes)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 4096"
                                    value={guess.cacheSize}
                                    onChange={(e) => setGuess({ ...guess, cacheSize: e.target.value })}
                                    className={styles.gameInput}
                                />
                            </div>
                        ) : (
                            <div className={styles.inputGroup}>
                                <label>Cache Size</label>
                                <div className={styles.staticValue}>{formatBytes(gameTarget.cacheSize)}</div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Block Size (Bytes)</label>
                            <input
                                type="number"
                                placeholder="e.g. 64"
                                value={guess.blockSize}
                                onChange={(e) => setGuess({ ...guess, blockSize: e.target.value })}
                                className={styles.gameInput}
                            />
                        </div>

                        {gameVariant === 'FIND_ASSOC' ? (
                            <div className={styles.inputGroup}>
                                <label>Associativity (Ways)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={guess.associativity}
                                    onChange={(e) => setGuess({ ...guess, associativity: e.target.value })}
                                    className={styles.gameInput}
                                />
                            </div>
                        ) : (
                            <div className={styles.inputGroup}>
                                <label>Associativity</label>
                                <div className={styles.staticValue}>
                                    {gameTarget.associativity === 1 ? 'Direct Mapped' : `${gameTarget.associativity}-way`}
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Tag Array Size (Bits)</label>
                            <input
                                type="number"
                                placeholder="e.g. 1024"
                                value={guess.tagArraySize}
                                onChange={(e) => setGuess({ ...guess, tagArraySize: e.target.value })}
                                className={styles.gameInput}
                            />
                        </div>

                        <button className={styles.checkBtn} onClick={checkSolution}>Check Answer</button>
                        {feedback && (
                            <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>
                )}

                {!isGameMode && (
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Number of Sets</span>
                            <span className={styles.statValue}>
                                {Math.pow(2, bits.indexBits).toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Blocks</span>
                            <span className={styles.statValue}>
                                {(currentCacheSize / currentBlockSize).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BitSlicer;
