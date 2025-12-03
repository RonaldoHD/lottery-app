import React, { useState, useEffect } from 'react';
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
} from '../../lib/pocketbase';

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, loading, logout, isAuthenticated } = useAdmin();
  
  // State
  const [activeTab, setActiveTab] = useState('draws');
  const [draws, setDraws] = useState([]);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [products, setProducts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Modal states
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingDraw, setEditingDraw] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
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
    retail_price: 0,
    stock: 0,
    odds: '',
    specifications: '',
  });

  // Auth check - only redirect if not authenticated (NO AUTO-LOAD)
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    // Only load data ONCE when authenticated - user must manually refresh if needed
    if (!loading && isAuthenticated() && !hasLoadedInitialData && !isLoadingData) {
      loadDraws();
      setHasLoadedInitialData(true);
    }
  }, [loading, isAuthenticated, hasLoadedInitialData, isLoadingData]);

  // Load products/submissions when draw selected (only when user selects)
  useEffect(() => {
    if (selectedDraw && isAuthenticated()) {
      loadDrawDetails(selectedDraw.id);
    }
  }, [selectedDraw]);

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
      retail_price: 0,
      stock: 0,
      odds: '',
      specifications: '',
    });
    setEditingProduct(null);
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
      // Parse specifications if it's a string
      const specs = typeof productForm.specifications === 'string' 
        ? productForm.specifications.split('\n').filter(s => s.trim())
        : productForm.specifications || [];
      
      await createProduct({
        ...productForm,
        draw_id: selectedDraw.id,
        specifications: specs,
        stock: productForm.stock || 0,
        odds: productForm.odds || '',
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
      retail_price: product.retail_price || 0,
      stock: product.stock || 0,
      odds: product.odds || '',
      specifications: Array.isArray(product.specifications) 
        ? product.specifications.join('\n')
        : product.specifications || '',
    });
    setShowProductModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !selectedDraw) return;
    try {
      // Parse specifications if it's a string
      const specs = typeof productForm.specifications === 'string' 
        ? productForm.specifications.split('\n').filter(s => s.trim())
        : productForm.specifications || [];
      
      await updateProduct(editingProduct.id, {
        ...productForm,
        specifications: specs,
        stock: productForm.stock || 0,
        odds: productForm.odds || '',
      });
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

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-winzone-purple flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-winzone-orange"></div>
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
    <div className="page-container">
      {/* Header */}
      <header className="header-admin">
        <div className="container-main">
          <div className="header-content-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/logo.png" 
                alt="WinZone Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white">Winzone Admin</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Manage draws & prizes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-responsive-xs text-slate-400 hidden sm:inline truncate max-w-[150px]">{admin?.email}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-main py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 lg:mb-8">
          {['draws', 'submissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'tab-active' : 'tab-inactive'}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'draws' && (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Draws List */}
            <div className="lg:col-span-1">
              <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-white">All Draws</h2>
                  <button
                    onClick={() => {
                      resetDrawForm();
                      setShowDrawModal(true);
                    }}
                    className="p-1.5 sm:p-2 btn-primary rounded-lg"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {isLoadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-winzone-orange"></div>
                  </div>
                ) : draws.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-sm">No draws yet. Create one!</p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {draws.map((draw) => (
                      <div
                        key={draw.id}
                        onClick={() => setSelectedDraw(draw)}
                        className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all ${
                          selectedDraw?.id === draw.id
                            ? 'bg-winzone-purple-light border-2 border-winzone-orange/50'
                            : 'bg-winzone-purple-light/50 border border-winzone-purple-light hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate text-sm sm:text-base">{draw.title}</h3>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1">${draw.entry_fee} entry</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusColors[draw.status]}`}>
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
                <div className="space-y-4 sm:space-y-6">
                  {/* Draw Info Card */}
                  <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-white break-words">{selectedDraw.title}</h2>
                        <p className="text-slate-400 mt-1 text-sm sm:text-base">{selectedDraw.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditDraw(selectedDraw)}
                          className="p-2 text-winzone-orange hover:text-winzone-orange-light hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Edit Draw"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDraw(selectedDraw.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Draw"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="bg-winzone-purple-light/50 rounded-xl p-3 sm:p-4">
                        <p className="text-slate-400 text-xs sm:text-sm">Entry Fee</p>
                        <p className="text-white text-lg sm:text-xl font-bold">${selectedDraw.entry_fee}</p>
                      </div>
                      <div className="bg-winzone-purple-light/50 rounded-xl p-3 sm:p-4">
                        <p className="text-slate-400 text-xs sm:text-sm">Status</p>
                        <span className={`inline-block mt-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${statusColors[selectedDraw.status]}`}>
                          {selectedDraw.status}
                        </span>
                      </div>
                      <div className="bg-winzone-purple-light/50 rounded-xl p-3 sm:p-4">
                        <p className="text-slate-400 text-xs sm:text-sm">Products</p>
                        <p className="text-white text-lg sm:text-xl font-bold">{products.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Products</h3>
                      <button
                        onClick={() => {
                          resetProductForm();
                          setShowProductModal(true);
                        }}
                        className="btn-primary-sm"
                      >
                        Add Product
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 text-sm">No products. Add one!</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="bg-winzone-purple-light/50 border border-winzone-purple-light rounded-xl p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm sm:text-base break-words">{product.name}</h4>
                                <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{product.description || 'No description'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <p className="text-emerald-400 font-semibold text-sm sm:text-base">${product.retail_price}</p>
                                  {product.stock !== undefined && (
                                    <p className="text-blue-400 text-xs sm:text-sm">Stock: {product.stock}</p>
                                  )}
                                  {product.odds && (
                                    <p className="text-purple-400 text-xs sm:text-sm">Odds: {product.odds}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-1.5 text-winzone-orange hover:text-winzone-orange-light hover:bg-amber-500/10 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submissions for this draw */}
                  <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Submissions ({submissions.length})</h3>
                    
                    {submissions.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 text-sm">No submissions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-slate-400 text-xs sm:text-sm border-b border-winzone-purple-light">
                              <th className="pb-2 sm:pb-3 font-medium">Email</th>
                              <th className="pb-2 sm:pb-3 font-medium">Name</th>
                              <th className="pb-2 sm:pb-3 font-medium hidden sm:table-cell">Date</th>
                              <th className="pb-2 sm:pb-3 font-medium">Status</th>
                              <th className="pb-2 sm:pb-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {submissions.map((sub) => (
                              <tr key={sub.id}>
                                <td className="py-2 sm:py-3 text-white text-xs sm:text-sm">{sub.user_email}</td>
                                <td className="py-2 sm:py-3 text-slate-300 text-xs sm:text-sm">{sub.user_name || '-'}</td>
                                <td className="py-2 sm:py-3 text-slate-400 text-xs sm:text-sm hidden sm:table-cell">
                                  {new Date(sub.created).toLocaleDateString()}
                                </td>
                                <td className="py-2 sm:py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${submissionStatusColors[sub.status]}`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="py-2 sm:py-3">
                                  <select
                                    value={sub.status}
                                    onChange={(e) => handleUpdateSubmissionStatus(sub.id, e.target.value)}
                                    className="bg-winzone-purple-light border border-winzone-purple-light text-white text-xs sm:text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
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
                <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-8 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-winzone-purple-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2">Select a draw</h3>
                  <p className="text-slate-500 text-sm sm:text-base">Choose a draw from the list to view details and manage products.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-winzone-purple-dark/50 backdrop-blur-xl border border-winzone-purple-light rounded-2xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">All Submissions</h2>
            <p className="text-slate-500 text-center py-8 text-sm sm:text-base">
              Select a draw from the "Draws" tab to view its submissions.
            </p>
          </div>
        )}
      </main>

      {/* Create/Edit Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-winzone-purple-dark border border-winzone-purple-light rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-winzone-purple-light">
              <h2 className="text-lg sm:text-xl font-bold text-white">{editingDraw ? 'Edit Draw' : 'Create New Draw'}</h2>
            </div>
            <form onSubmit={editingDraw ? handleUpdateDraw : handleCreateDraw} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={drawForm.title}
                  onChange={(e) => setDrawForm({ ...drawForm, title: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={drawForm.description}
                  onChange={(e) => setDrawForm({ ...drawForm, description: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={drawForm.image_url}
                  onChange={(e) => setDrawForm({ ...drawForm, image_url: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Entry Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={drawForm.entry_fee}
                    onChange={(e) => setDrawForm({ ...drawForm, entry_fee: parseFloat(e.target.value) })}
                    className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={drawForm.status}
                    onChange={(e) => setDrawForm({ ...drawForm, status: e.target.value })}
                    className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawModal(false);
                    resetDrawForm();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white bg-winzone-purple-light hover:bg-winzone-purple-light/80 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-winzone-orange text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-winzone-orange-dark transition-all"
                >
                  {editingDraw ? 'Update Draw' : 'Create Draw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-winzone-purple-dark border border-winzone-purple-light rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-winzone-purple-light">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : `Add Product to "${selectedDraw?.title}"`}
              </h2>
            </div>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Product Name (Title) *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.retail_price}
                    onChange={(e) => setProductForm({ ...productForm, retail_price: parseFloat(e.target.value) })}
                    className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Odds</label>
                <input
                  type="text"
                  value={productForm.odds}
                  onChange={(e) => setProductForm({ ...productForm, odds: e.target.value })}
                  placeholder="e.g., 1 in 100"
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Specifications (one per line)</label>
                <textarea
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="w-full bg-winzone-purple-light/50 border border-winzone-purple-light text-white text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-winzone-orange/50 h-32 resize-none"
                  placeholder="Enter specifications, one per line..."
                />
              </div>
              <div className="flex justify-end gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white bg-winzone-purple-light hover:bg-winzone-purple-light/80 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-winzone-orange text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-winzone-orange-dark transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
