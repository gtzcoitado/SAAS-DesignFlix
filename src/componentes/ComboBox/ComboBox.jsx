import React, { useState, useRef, useEffect } from 'react';
import styles from './ComboBox.module.css';

const ChevronDownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ComboBox = ({ options, defaultValue, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(defaultValue);
    const wrapperRef = useRef(null);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        if (onChange) {
            onChange(option);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className={styles.comboBoxWrapper} ref={wrapperRef}>
            <div className={styles.displayArea} onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedOption ? selectedOption.label : 'Select an option'}</span>
                <ChevronDownIcon />
            </div>
            {isOpen && (
                <ul className={styles.dropdownList}>
                    {options.map((option) => (
                        <li 
                            key={option.value} 
                            className={`${styles.dropdownItem} ${selectedOption?.value === option.value ? styles.selected : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ComboBox;