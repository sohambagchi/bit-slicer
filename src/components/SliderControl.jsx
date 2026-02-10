import React from 'react';
import styles from './SliderControl.module.css';

const SliderControl = ({ label, value, min, max, step, onChange, formatValue, disabled, extraControl, footer }) => {
    return (
        <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
            <div className={styles.header}>
                <label className={styles.label}>{label}</label>
                <div className={styles.headerRight}>
                    {extraControl && <div className={styles.extraControl}>{extraControl}</div>}
                    <span className={styles.value}>
                        {formatValue ? formatValue(value) : value}
                    </span>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`${styles.slider} ${disabled ? styles.sliderDisabled : ''}`}
                disabled={disabled}
            />
            <div className={styles.ticks}>
                <span>{formatValue ? formatValue(min) : min}</span>
                <span>{formatValue ? formatValue(max) : max}</span>
            </div>
            {footer && <div className={styles.footer}>{footer}</div>}
        </div>
    );
};

export default SliderControl;
