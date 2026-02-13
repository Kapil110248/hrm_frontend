import React, { useState, useEffect } from 'react';
import Table from '../../components/Table';
import { api } from '../../services/api';

const Parties = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Party Name', accessor: 'name' },
        { header: 'City', accessor: 'city' },
        { header: 'Balance', accessor: 'balance' },
    ];

    useEffect(() => {
        api.fetchParties().then(data => {
            setParties(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-[#0055E5] border-b-2 border-[#0055E5] pr-12 pb-1">Party Master</h1>
                <button className="bg-[#0055E5] text-white px-4 py-1.5 font-bold hover:bg-blue-700 shadow-md">Add New Party</button>
            </div>

            {loading ? (
                <div className="p-10 text-center animate-pulse text-blue-800 font-bold">Loading records...</div>
            ) : (
                <Table
                    columns={columns}
                    data={parties}
                    actions={[
                        { label: 'Edit', onClick: (p) => console.log('Edit party', p) }
                    ]}
                />
            )}
        </div>
    );
};

export default Parties;
