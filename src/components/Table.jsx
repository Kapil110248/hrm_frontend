import React from 'react';
import EditableCell from './EditableCell';

/**
 * Shared Table Component
 * 
 * @param {Array} columns - Array of column definitions:
 *   - header: string
 *   - accessor: string
 *   - align: 'left' | 'center' | 'right'
 *   - width: string (optional)
 *   - render: (value, row) => ReactNode (optional custom renderer)
 *   - editable: boolean (optional, enables EditableCell)
 * @param {Array} data - Array of data objects
 * @param {string} rowKey - Unique key field for rows (default: 'id')
 * @param {Array} actions - Array of action definitions:
 *   - label: string | ReactNode
 *   - onClick: (row) => void
 *   - className: string (optional)
 *   - show: (row) => boolean (optional condition)
 *   - disabled: (row) => boolean (optional condition)
 * @param {Function} onRowClick - (row) => void (optional)
 * @param {Function} onCellChange - (row, column, newValue) => void (required if editable columns exist)
 * @param {boolean} isLoading - Show loading state
 */
const Table = ({
    columns,
    data = [],
    rowKey = 'id',
    actions = [],
    onRowClick,
    onCellChange,
    isLoading = false,
    minRows = 0
}) => {
    if (isLoading) {
        return <div className="p-4 text-center text-gray-500 italic">Loading records...</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="border border-gray-400 p-8 text-center bg-gray-50 text-gray-500 italic">
                No records found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-gray-400 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[#D4D0C8] sticky top-0 z-10">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={col.accessor || idx}
                                className={`px-2 py-1.5 border border-gray-400 font-bold text-gray-700 select-none ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                    }`}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="px-2 py-1.5 border border-gray-400 font-bold text-gray-700 text-center w-24">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rIdx) => {
                        // Resolve row visual state
                        const isReadOnly = row.readonly || row.locked;
                        const isLocked = row.locked;
                        const isHighlighted = row.highlighted;

                        let rowClass = "hover:bg-blue-50 transition-colors border-b border-gray-200 group";
                        if (isHighlighted) rowClass += " bg-yellow-50";
                        if (isLocked) rowClass += " bg-gray-100 text-gray-500";
                        if (onRowClick) rowClass += " cursor-pointer";

                        return (
                            <tr
                                key={row[rowKey] || rIdx}
                                className={rowClass}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((col, cIdx) => {
                                    const value = row[col.accessor];
                                    const cellKey = `${row[rowKey] || rIdx}-${col.accessor || cIdx}`;

                                    return (
                                        <td
                                            key={cellKey}
                                            className={`px-2 py-1.5 border-r border-gray-300 last:border-r-0 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                                }`}
                                        >
                                            {/* Priority: Custom Render -> Editable Cell -> Default Text */}
                                            {col.render ? (
                                                col.render(value, row)
                                            ) : col.editable && !isReadOnly ? (
                                                <EditableCell
                                                    value={value}
                                                    onChange={(newVal) => onCellChange && onCellChange(row, col.accessor, newVal)}
                                                    disabled={isLocked}
                                                />
                                            ) : (
                                                <span className={isLocked ? "italic text-gray-500" : ""}>
                                                    {value}
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}

                                {actions.length > 0 && (
                                    <td className="px-2 py-1.5 border-l border-gray-300 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2">
                                            {actions.map((action, aIdx) => {
                                                if (action.show && !action.show(row)) return null;
                                                const isDisabled = action.disabled ? action.disabled(row) : false;

                                                return (
                                                    <button
                                                        key={aIdx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            action.onClick(row);
                                                        }}
                                                        disabled={isDisabled}
                                                        className={`text-xs font-bold px-2 py-0.5 rounded border shadow-sm transition-all
                                                            ${isDisabled
                                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                : action.className || 'bg-white border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                                                            }`}
                                                        title={action.title}
                                                    >
                                                        {action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    {/* Padding Rows for Legacy Layout */}
                    {data.length < minRows &&
                        [...Array(minRows - data.length)].map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-gray-100 bg-white h-8">
                                {columns.map((col, cIdx) => (
                                    <td key={`empty-cell-${cIdx}`} className="px-2 py-1.5 border-r border-gray-200 last:border-r-0">
                                        &nbsp;
                                    </td>
                                ))}
                                {actions.length > 0 && <td className="border-l border-gray-300"></td>}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

export default Table;
