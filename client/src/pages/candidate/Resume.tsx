import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, Upload, Download, Trash2, 
  AlertCircle, CheckCircle, Loader, 
  Lock, Eye, ShieldCheck, Copy, Check,
  File, FileCode, FileJson, FileArchive
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import apiService from '../../services/apiService';

// --- Interfaces ---
interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url: string;
  type: string;
  isPrivate?: boolean;
}

const Resume: React.FC = () => {
  // --- State ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [privacyLoadingId, setPrivacyLoadingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // --- Constants ---
  const ALLOWED_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Fetch documents from the secure API
   */
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Document[]>('/users/documents');
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError('Failed to load documents. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Get file icon based on type
   */
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <FileCode className="w-5 h-5 text-blue-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileJson className="w-5 h-5 text-green-500" />;
    if (type.includes('text')) return <File className="w-5 h-5 text-gray-500" />;
    return <FileArchive className="w-5 h-5 text-purple-500" />;
  };

  /**
   * File Upload Handler
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Allowed: PDF, Word, Excel, Text documents.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('document', file); 

      const response = await apiService.post<Document>('/users/documents', formData);
      
      // The API returns the document in the data field
      setDocuments(prev => [response, ...prev]);
      
      setSuccess('✓ Document uploaded successfully');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  /**
   * Delete Document Handler
   */
  const handleDelete = async (docId: string) => {
    if (!window.confirm('Delete this document permanently?')) return;

    try {
      setDeletingId(docId);
      await apiService.delete(`/users/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setSuccess('✓ Document deleted');
    } catch (err) {
      setError('Failed to delete document.');
    } finally {
      setDeletingId(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  /**
   * Toggle Document Privacy
   */
  const handleTogglePrivacy = async (docId: string, currentPrivacy: boolean) => {
    try {
      setPrivacyLoadingId(docId);
      const updatedDoc = await apiService.patch<Document>(`/users/documents/${docId}/privacy`, {
        isPrivate: !currentPrivacy
      });
      
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { ...doc, isPrivate: updatedDoc.isPrivate } : doc
      ));
      setSuccess(`✓ Document is now ${!currentPrivacy ? 'Private' : 'Public'}`);
    } catch (err) {
      setError('Failed to update privacy settings.');
    } finally {
      setPrivacyLoadingId(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  /**
   * Copy download link
   */
  const handleCopyLink = (url: string, docId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopiedId(docId);
    setSuccess('✓ Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Filter and sort documents
   */
  const filteredDocuments = documents
    .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return parseFloat(a.size) - parseFloat(b.size);
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  /**
   * Helpers
   */
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      dragCounter.current++; setDragActive(true);
    } else if (e.type === 'dragleave') {
      dragCounter.current--; if (dragCounter.current === 0) setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); dragCounter.current = 0;
    if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
  };

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="text-blue-600 w-9 h-9" /> Resume & Documents
              </h1>
              <p className="text-slate-600 font-medium mt-2">Securely manage your professional documents</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in duration-300">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 font-medium text-sm">{success}</p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            <FileText className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <h3 className="text-lg font-bold text-slate-800">Drag documents here or click to browse</h3>
            <p className="text-slate-500 text-sm mt-2">PDF, Word, Excel, Text • Up to 50MB</p>
          </div>

          <input
            ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)} disabled={uploading}
          />

          {/* Search and Sort Controls */}
          {documents.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
            </div>
          )}

          {/* Documents Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-24 bg-white rounded-lg border border-slate-200">
                <Loader className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                <p className="text-slate-600 font-medium mt-4">Loading your documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="p-5 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 bg-slate-100 p-3 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900 truncate">{doc.name}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                            doc.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {doc.isPrivate ? '🔒 Private' : '🌐 Public'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{doc.size} • {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button 
                        onClick={() => handleTogglePrivacy(doc.id, doc.isPrivate || false)}
                        disabled={privacyLoadingId === doc.id}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                        title={doc.isPrivate ? 'Make Public' : 'Make Private'}
                      >
                        {privacyLoadingId === doc.id ? <Loader className="w-4 h-4 animate-spin" /> : doc.isPrivate ? <Lock size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => handleCopyLink(doc.url, doc.id)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Copy link"
                      >
                        {copiedId === doc.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                      <button 
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === doc.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-lg border border-slate-200">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold text-lg">No documents yet</p>
                <p className="text-slate-500 text-sm mt-2">Upload your resume and professional documents to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;