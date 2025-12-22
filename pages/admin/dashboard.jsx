import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAdmin } from '../../context/AdminContext';
import {
  getAllDrawsAdmin,
  createDraw,
  updateDraw,
  deleteDraw,
  getProductsByDrawId,
  createProduct,
  updateProduct,
  deleteProduct,
  getSubmissionsByDrawId,
  updateSubmissionStatus,
  getAllEbooks,
  createEbook,
  updateEbook,
  deleteEbook,
} from '../../lib/pocketbase';

// PDF Upload Component
function PDFUpload({ value, onChange, label = "PDF File" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPdfUrl(value || '');
  }, [value]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF file');
      return;
    }

    // Validate file size (max 50MB for PDFs)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('PDF must be less than 50MB');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('collection', 'ebooks_content'); // Specify the collection

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.instructions) {
          throw new Error(`${data.error}\n\n${data.instructions}`);
        }
        throw new Error(data.error || 'Upload failed');
      }

      const pdfUrl = data.fileUrl || data.imageUrl;
      setPdfUrl(pdfUrl);
      onChange(pdfUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPdfUrl(url);
    onChange(url);
    setUploadError('');
  };

  const handleRemovePDF = () => {
    setPdfUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      
      {/* Preview/Info */}
      {pdfUrl && (
        <div className="relative w-full bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">PDF File</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-400 text-xs hover:text-amber-300 truncate block"
              >
                {pdfUrl}
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemovePDF}
              className="p-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={pdfUrl}
            onChange={handleUrlChange}
            placeholder="Paste PDF URL or upload..."
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500 text-sm"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-rose-400 text-xs whitespace-pre-wrap">{uploadError}</p>
        </div>
      )}
      
      <p className="text-slate-500 text-xs">
        Upload a PDF file (max 50MB, stored in PocketBase) or paste a URL
      </p>
    </div>
  );
}

// Image Upload Component
function ImageUpload({ value, onChange, label = "Image" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for admin authentication
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a missing collection error
        if (data.instructions) {
          throw new Error(`${data.error}\n\n${data.instructions}`);
        }
        throw new Error(data.error || 'Upload failed');
      }

      setPreviewUrl(data.imageUrl);
      onChange(data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange(url);
    setUploadError('');
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      
      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full h-40 bg-slate-800 rounded-xl overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl('')}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={previewUrl}
            onChange={handleUrlChange}
            placeholder="Paste image URL or upload..."
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500 text-sm"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-rose-400 text-xs whitespace-pre-wrap">{uploadError}</p>
        </div>
      )}
      
      <p className="text-slate-500 text-xs">
        Upload an image (max 10MB, stored in PocketBase) or paste a URL
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, loading, logout, isAuthenticated } = useAdmin();
  
  // State
  const [activeTab, setActiveTab] = useState('draws');
  const [draws, setDraws] = useState([]);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [products, setProducts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Modal states
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [editingDraw, setEditingDraw] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingEbook, setEditingEbook] = useState(null);
  
  // Form states
  const [drawForm, setDrawForm] = useState({
    title: '',
    description: '',
    image_url: '',
    entry_fee: 2,
    status: 'draft',
    start_date: '',
    end_date: '',
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  const [ebookForm, setEbookForm] = useState({
    name: '',
    content: '',
    pages: '',
    price: '',
    image: '',
  });

  // Auth check
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    if (!loading && isAuthenticated() && !hasLoadedInitialData && !isLoadingData) {
      loadDraws();
      if (activeTab === 'ebooks') {
        loadEbooks();
      }
      setHasLoadedInitialData(true);
    }
  }, [loading, isAuthenticated, hasLoadedInitialData, isLoadingData, activeTab]);

  useEffect(() => {
    if (selectedDraw && isAuthenticated()) {
      loadDrawDetails(selectedDraw.id);
    }
  }, [selectedDraw]);

  useEffect(() => {
    if (activeTab === 'ebooks' && isAuthenticated()) {
      loadEbooks();
    }
  }, [activeTab]);

  const loadDraws = async () => {
    setIsLoadingData(true);
    try {
      const data = await getAllDrawsAdmin();
      setDraws(data);
    } catch (error) {
      console.error('Error loading draws:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadDrawDetails = async (drawId) => {
    try {
      const [productsData, submissionsData] = await Promise.all([
        getProductsByDrawId(drawId),
        getSubmissionsByDrawId(drawId),
      ]);
      setProducts(productsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading draw details:', error);
    }
  };

  const loadEbooks = async () => {
    setIsLoadingData(true);
    try {
      const data = await getAllEbooks();
      setEbooks(data);
    } catch (error) {
      console.error('Error loading ebooks:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const resetDrawForm = () => {
    setDrawForm({
      title: '',
      description: '',
      image_url: '',
      entry_fee: 2,
      status: 'draft',
      start_date: '',
      end_date: '',
    });
    setEditingDraw(null);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      image_url: '',
    });
    setEditingProduct(null);
  };

  const resetEbookForm = () => {
    setEbookForm({
      name: '',
      content: '',
      pages: '',
      price: '',
      image: '',
    });
    setEditingEbook(null);
  };

  const handleCreateDraw = async (e) => {
    e.preventDefault();
    try {
      await createDraw(drawForm);
      setShowDrawModal(false);
      resetDrawForm();
      loadDraws();
    } catch (error) {
      alert('Error creating draw: ' + error.message);
    }
  };

  const handleEditDraw = (draw) => {
    setEditingDraw(draw);
    setDrawForm({
      title: draw.title || '',
      description: draw.description || '',
      image_url: draw.image_url || '',
      entry_fee: draw.entry_fee || 2,
      status: draw.status || 'draft',
      start_date: draw.start_date || '',
      end_date: draw.end_date || '',
    });
    setShowDrawModal(true);
  };

  const handleUpdateDraw = async (e) => {
    e.preventDefault();
    if (!editingDraw) return;
    try {
      await updateDraw(editingDraw.id, drawForm);
      setShowDrawModal(false);
      resetDrawForm();
      loadDraws();
      if (selectedDraw?.id === editingDraw.id) {
        setSelectedDraw({ ...selectedDraw, ...drawForm });
      }
    } catch (error) {
      alert('Error updating draw: ' + error.message);
    }
  };

  const handleDeleteDraw = async (id) => {
    if (confirm('Are you sure you want to delete this draw? This will also delete all associated products.')) {
      try {
        await deleteDraw(id);
        if (selectedDraw?.id === id) {
          setSelectedDraw(null);
        }
        loadDraws();
      } catch (error) {
        alert('Error deleting draw: ' + error.message);
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedDraw) return;
    try {
      await createProduct({
        ...productForm,
        draw_id: selectedDraw.id,
      });
      setShowProductModal(false);
      resetProductForm();
      loadDrawDetails(selectedDraw.id);
    } catch (error) {
      alert('Error creating product: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      image_url: product.image_url || '',
    });
    setShowProductModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !selectedDraw) return;
    try {
      await updateProduct(editingProduct.id, productForm);
      setShowProductModal(false);
      resetProductForm();
      loadDrawDetails(selectedDraw.id);
    } catch (error) {
      alert('Error updating product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadDrawDetails(selectedDraw.id);
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
    }
  };

  const handleUpdateSubmissionStatus = async (id, status) => {
    try {
      await updateSubmissionStatus(id, status);
      loadDrawDetails(selectedDraw.id);
    } catch (error) {
      alert('Error updating submission: ' + error.message);
    }
  };

  const handleCreateEbook = async (e) => {
    e.preventDefault();
    try {
      await createEbook({
        ...ebookForm,
        pages: ebookForm.pages ? parseInt(ebookForm.pages) : null,
        price: ebookForm.price ? parseFloat(ebookForm.price) : 0,
      });
      setShowEbookModal(false);
      resetEbookForm();
      loadEbooks();
    } catch (error) {
      alert('Error creating ebook: ' + error.message);
    }
  };

  const handleEditEbook = (ebook) => {
    setEditingEbook(ebook);
    setEbookForm({
      name: ebook.name || '',
      content: ebook.content || '',
      pages: ebook.pages || '',
      price: ebook.price || '',
      image: typeof ebook.image === 'string' ? ebook.image : ebook.image_url || '',
    });
    setShowEbookModal(true);
  };

  const handleUpdateEbook = async (e) => {
    e.preventDefault();
    if (!editingEbook) return;
    try {
      await updateEbook(editingEbook.id, {
        ...ebookForm,
        pages: ebookForm.pages ? parseInt(ebookForm.pages) : null,
        price: ebookForm.price ? parseFloat(ebookForm.price) : 0,
      });
      setShowEbookModal(false);
      resetEbookForm();
      loadEbooks();
    } catch (error) {
      alert('Error updating ebook: ' + error.message);
    }
  };

  const handleDeleteEbook = async (id) => {
    if (confirm('Are you sure you want to delete this ebook?')) {
      try {
        await deleteEbook(id);
        loadEbooks();
      } catch (error) {
        alert('Error deleting ebook: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-slate-600 text-slate-100',
    active: 'bg-emerald-600 text-emerald-100',
    completed: 'bg-blue-600 text-blue-100',
  };

  const submissionStatusColors = {
    pending: 'bg-amber-600 text-amber-100',
    confirmed: 'bg-emerald-600 text-emerald-100',
    winner: 'bg-purple-600 text-purple-100',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Manage draws & prizes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">{admin?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['draws', 'ebooks', 'submissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'draws' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Draws List */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">All Draws</h2>
                  <button
                    onClick={() => {
                      resetDrawForm();
                      setShowDrawModal(true);
                    }}
                    className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {isLoadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : draws.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No draws yet. Create one!</p>
                ) : (
                  <div className="space-y-3">
                    {draws.map((draw) => (
                      <div
                        key={draw.id}
                        onClick={() => setSelectedDraw(draw)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedDraw?.id === draw.id
                            ? 'bg-slate-800 border-2 border-amber-500/50'
                            : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">{draw.title}</h3>
                            <p className="text-slate-400 text-sm mt-1">${draw.entry_fee} entry</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[draw.status]}`}>
                            {draw.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Draw Details */}
            <div className="lg:col-span-2">
              {selectedDraw ? (
                <div className="space-y-6">
                  {/* Draw Info Card */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedDraw.title}</h2>
                        <p className="text-slate-400 mt-1">{selectedDraw.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDraw(selectedDraw)}
                          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDraw(selectedDraw.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm">Entry Fee</p>
                        <p className="text-white text-xl font-bold">${selectedDraw.entry_fee}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm">Status</p>
                        <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedDraw.status]}`}>
                          {selectedDraw.status}
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm">Products</p>
                        <p className="text-white text-xl font-bold">{products.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Products</h3>
                      <button
                        onClick={() => {
                          resetProductForm();
                          setShowProductModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg"
                      >
                        Add Product
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No products. Add one!</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            {product.image_url && (
                              <div className="h-32 bg-slate-700">
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-medium">{product.name}</h4>
                                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{product.description || 'No description'}</p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submissions for this draw */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Submissions ({submissions.length})</h3>
                    
                    {submissions.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No submissions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                              <th className="pb-3 font-medium">First Name</th>
                              <th className="pb-3 font-medium">Last Name</th>
                              <th className="pb-3 font-medium">Phone</th>
                              <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {submissions.map((sub) => (
                              <tr key={sub.id}>
                                <td className="py-3 text-white">{sub.first_name || sub.user_name || '-'}</td>
                                <td className="py-3 text-slate-300">{sub.last_name || sub.user_lastname || '-'}</td>
                                <td className="py-3 text-slate-300">{sub.phone || '-'}</td>
                                <td className="py-3 text-slate-400 text-sm hidden sm:table-cell">
                                  {new Date(sub.created).toLocaleDateString()}
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${submissionStatusColors[sub.status]}`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <select
                                    value={sub.status}
                                    onChange={(e) => handleUpdateSubmissionStatus(sub.id, e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="winner">Winner</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Select a draw</h3>
                  <p className="text-slate-500">Choose a draw from the list to view details and manage products.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ebooks' && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Ebooks</h2>
              <button
                onClick={() => {
                  resetEbookForm();
                  setShowEbookModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Add Ebook
              </button>
            </div>

            {isLoadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : ebooks.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No ebooks yet. Create one!</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ebooks.map((ebook) => {
                  const imageUrl = typeof ebook.image === 'string' 
                    ? ebook.image 
                    : ebook.image_url || (ebook.image && typeof ebook.image === 'object' ? ebook.image.url : null);
                  
                  return (
                    <div key={ebook.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                      {imageUrl && (
                        <div className="h-48 bg-slate-700">
                          <img 
                            src={imageUrl} 
                            alt={ebook.name || 'Ebook'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{ebook.name || 'Untitled'}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              {ebook.pages && (
                                <span className="text-slate-400 text-sm">{ebook.pages} pages</span>
                              )}
                              <span className="text-amber-400 font-semibold">${ebook.price || '0'}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEditEbook(ebook)}
                              className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEbook(ebook.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {ebook.content && (
                          <div className="mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <a 
                              href={typeof ebook.content === 'string' ? ebook.content : ebook.content.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 text-sm hover:text-amber-300 truncate"
                            >
                              View PDF
                            </a>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-slate-500 text-xs">
                            Created: {new Date(ebook.created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">All Submissions</h2>
            <p className="text-slate-500 text-center py-8">
              Select a draw from the "Draws" tab to view its submissions.
            </p>
          </div>
        )}
      </main>

      {/* Create/Edit Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingDraw ? 'Edit Draw' : 'Create New Draw'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {editingDraw ? 'Update the draw details below' : 'Fill in the details to create a new draw'}
              </p>
            </div>
            <form onSubmit={editingDraw ? handleUpdateDraw : handleCreateDraw} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Draw Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={drawForm.title}
                  onChange={(e) => setDrawForm({ ...drawForm, title: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro Max Giveaway"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={drawForm.description}
                  onChange={(e) => setDrawForm({ ...drawForm, description: e.target.value })}
                  placeholder="Describe what participants can win..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={drawForm.image_url}
                onChange={(url) => setDrawForm({ ...drawForm, image_url: url })}
                label="Draw Image"
              />

              {/* Entry Fee & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Entry Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={drawForm.entry_fee}
                    onChange={(e) => setDrawForm({ ...drawForm, entry_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={drawForm.status}
                    onChange={(e) => setDrawForm({ ...drawForm, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date (for countdown)
                </label>
                <input
                  type="datetime-local"
                  value={drawForm.end_date ? drawForm.end_date.slice(0, 16) : ''}
                  onChange={(e) => setDrawForm({ ...drawForm, end_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawModal(false);
                    resetDrawForm();
                  }}
                  className="flex-1 px-6 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg shadow-amber-500/25"
                >
                  {editingDraw ? 'Save Changes' : 'Create Draw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {editingProduct ? 'Update the product details' : `Adding product to "${selectedDraw?.title}"`}
              </p>
            </div>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro Max 256GB"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product details, specifications, etc."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={productForm.image_url}
                onChange={(url) => setProductForm({ ...productForm, image_url: url })}
                label="Product Image"
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="flex-1 px-6 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg shadow-amber-500/25"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Ebook Modal */}
      {showEbookModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingEbook ? 'Edit Ebook' : 'Create New Ebook'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {editingEbook ? 'Update the ebook details below' : 'Fill in the details to create a new ebook'}
              </p>
            </div>
            <form onSubmit={editingEbook ? handleUpdateEbook : handleCreateEbook} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ebook Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={ebookForm.name}
                  onChange={(e) => setEbookForm({ ...ebookForm, name: e.target.value })}
                  placeholder="e.g., Complete Guide to Web Development"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                  required
                />
              </div>

              {/* PDF Content Upload */}
              <PDFUpload
                value={ebookForm.content}
                onChange={(url) => setEbookForm({ ...ebookForm, content: url })}
                label="Ebook PDF Content"
              />

              {/* Pages & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pages
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ebookForm.pages}
                    onChange={(e) => setEbookForm({ ...ebookForm, pages: e.target.value })}
                    placeholder="e.g., 250"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ebookForm.price}
                    onChange={(e) => setEbookForm({ ...ebookForm, price: e.target.value })}
                    placeholder="e.g., 29.99"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={ebookForm.image}
                onChange={(url) => setEbookForm({ ...ebookForm, image: url })}
                label="Ebook Image"
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEbookModal(false);
                    resetEbookForm();
                  }}
                  className="flex-1 px-6 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg shadow-amber-500/25"
                >
                  {editingEbook ? 'Save Changes' : 'Create Ebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
