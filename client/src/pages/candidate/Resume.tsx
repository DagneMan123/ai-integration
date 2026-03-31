import React, { useState } from 'react';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const Resume: React.FC = () => {
  const [documents] = useState<any[]>([]);

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resume & Documents</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your professional documents</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drag and drop your documents</h3>
            <p className="text-gray-500">or click to browse (PDF, DOC, DOCX)</p>
          </div>

          {/* Documents List */}
          {documents.length > 0 ? (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{doc.size} • {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-bold">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;
