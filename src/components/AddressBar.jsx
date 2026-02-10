import React from 'react';
import styles from './AddressBar.module.css';

const AddressBar = ({ tagBits, indexBits, offsetBits, totalBits = 32 }) => {
    // Calculate percentages for width
    const tagWidth = (tagBits / totalBits) * 100;
    const indexWidth = (indexBits / totalBits) * 100;
    const offsetWidth = (offsetBits / totalBits) * 100;

    // Calculate bit ranges
    const offsetRange = offsetBits > 0 ? `0 - ${offsetBits - 1}` : 'N/A';
    const indexRange = indexBits > 0 ? `${offsetBits} - ${offsetBits + indexBits - 1}` : 'N/A';
    const tagRange = tagBits > 0 ? `${offsetBits + indexBits} - ${totalBits - 1}` : 'N/A';

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Address Breakdown ({totalBits}-bit)</h3>
            <div className={styles.bar}>
                {tagBits > 0 && (
                    <div
                        className={`${styles.section} ${styles.tag}`}
                        style={{ width: `${tagWidth}%` }}
                        title={`Tag: Bits ${tagRange}`}
                    >
                        <span className={styles.label}>Tag</span>
                        <span className={styles.count}>{tagBits} bits</span>
                        <div className={styles.tooltip}>Bits {tagRange}</div>
                    </div>
                )}
                {indexBits > 0 && (
                    <div
                        className={`${styles.section} ${styles.index}`}
                        style={{ width: `${indexWidth}%` }}
                        title={`Index: Bits ${indexRange}`}
                    >
                        <span className={styles.label}>Index</span>
                        <span className={styles.count}>{indexBits} bits</span>
                        <div className={styles.tooltip}>Bits {indexRange}</div>
                    </div>
                )}
                {offsetBits > 0 && (
                    <div
                        className={`${styles.section} ${styles.offset}`}
                        style={{ width: `${offsetWidth}%` }}
                        title={`Offset: Bits ${offsetRange}`}
                    >
                        <span className={styles.label}>Offset</span>
                        <span className={styles.count}>{offsetBits} bits</span>
                        <div className={styles.tooltip}>Bits {offsetRange}</div>
                    </div>
                )}
            </div>
            <div className={styles.legend}>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.tagDot}`}></span>Tag</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.indexDot}`}></span>Index</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.offsetDot}`}></span>Offset</div>
            </div>
        </div>
    );
};

export default AddressBar;
