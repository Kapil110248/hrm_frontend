import React, { useEffect, useState } from 'react';

const EditableCell = ({
    value,
    onChange,
    onBlur,
    disabled = false,
    type = 'text',
    className = ''
}) => {
    // Internal state to handle local edits before committing
    const [localValue, setLocalValue] = useState(value ?? '');

    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur(localValue); // Commit on blur
        }
    };

    return (
        <input
            type={type}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-full px-1 border border-gray-300 focus:outline-none focus:border-blue-500 
                ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-yellow-50'} 
                ${className}`}
        />
    );
};

export default EditableCell;
