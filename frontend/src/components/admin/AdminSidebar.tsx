// src/admin/components/AdminSidebar.tsx
import React from 'react';
import { FaUsers, FaBook } from 'react-icons/fa';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">Admin Panel</h2>
      <nav>
        {['Dashboard', 'User Management', 'Course Management'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-4 py-2 mb-2 rounded-lg ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-black hover:bg-gray-200'
            }`}
          >
            {tab === 'Dashboard' && <FaUsers className="inline mr-2" />}
            {tab === 'User Management' && <FaUsers className="inline mr-2" />}
            {tab === 'Course Management' && <FaBook className="inline mr-2" />}
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
