import React from 'react';
import { useParams } from 'react-router-dom';

const EditJob: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Job</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Edit job form for ID: {id}</p>
          <p className="text-sm text-gray-500 mt-2">This page is under construction. Use the same form as Create Job.</p>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
