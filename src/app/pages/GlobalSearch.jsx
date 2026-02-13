import React, { useState } from 'react';
import { Search, User, FileText, Settings, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    // Mock Data for Search (CLEARED TO REMOVE PLACEHOLDERS)
    const searchData = [];

    const filteredResults = searchData.filter(item => {
        const matchesTerm = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || item.type === category;
        return matchesTerm && matchesCategory;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'Employee': return <User size={16} className="text-blue-600" />;
            case 'Page': return <FileText size={16} className="text-gray-600" />;
            case 'Report': return <FileText size={16} className="text-green-600" />;
            case 'Setting': return <Settings size={16} className="text-gray-600" />;
            default: return <Search size={16} />;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-[#EBE9D8] font-sans pb-6">
            <div className="flex flex-col items-center justify-center pt-6 pb-4 px-4 sticky top-0 bg-[#EBE9D8] z-10 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <Search size={24} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-[#0B4FD7] uppercase tracking-wider">Global System Search</h1>
                </div>

                <div className="w-full max-w-2xl relative">
                    <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search employees, reports, pages, or transactions..."
                        className="w-full p-3 rounded shadow-[2px_2px_0_rgba(0,0,0,0.1)] border-2 border-blue-100 focus:border-blue-600 focus:shadow-[4px_4px_0_rgba(11,79,215,0.2)] outline-none text-base font-bold text-gray-700 transition-all uppercase placeholder:normal-case"
                    />
                </div>

                <div className="flex gap-2 mt-3">
                    {['All', 'Employee', 'Page', 'Report', 'Transaction'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${category === cat
                                ? 'bg-[#0B4FD7] text-white shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pt-6">
                <div className="max-w-5xl mx-auto">
                    {searchTerm && filteredResults.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="font-bold">No results found for "{searchTerm}"</p>
                            <p className="text-xs mt-1">Try checking your spelling or using different keywords.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredResults.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className="bg-white border border-gray-200 p-2.5 rounded hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-50 rounded group-hover:bg-blue-50 transition-colors">
                                            {getIcon(item.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-[13px] group-hover:text-blue-700 leading-tight">{item.title}</h3>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!searchTerm && (
                        <div className="text-center py-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type above to begin searching...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
