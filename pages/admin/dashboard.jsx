import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdmin } from '../../context/AdminContext';
import {
  getAllDrawsAdmin,
  createDraw,
  deleteDraw,
  getProductsByDrawId,
  createProduct,
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Modal states
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
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
  });

  // Auth check
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  // Load draws
  useEffect(() => {
    if (isAuthenticated()) {
      loadDraws();
    }
  }, [loading]);

  // Load products/submissions when draw selected
  useEffect(() => {
    if (selectedDraw) {
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
    }
    setIsLoadingData(false);
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

  const handleCreateDraw = async (e) => {
    e.preventDefault();
    try {
      await createDraw(drawForm);
      setShowDrawModal(false);
      setDrawForm({
        title: '',
        description: '',
        image_url: '',
        entry_fee: 2,
        status: 'draft',
        start_date: '',
        end_date: '',
      });
      loadDraws();
    } catch (error) {
      alert('Error creating draw: ' + error.message);
    }
  };

  const handleDeleteDraw = async (id) => {
    if (confirm('Are you sure you want to delete this draw? This will also delete all associated products.')) {
      try {
        await deleteDraw(id);
        setSelectedDraw(null);
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
      setProductForm({
        name: '',
        description: '',
        image_url: '',
        retail_price: 0,
      });
      loadDrawDetails(selectedDraw.id);
    } catch (error) {
      alert('Error creating product: ' + error.message);
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
    router.push('/admin/login');
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
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Manage draws & prizes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{admin?.email}</span>
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
          {['draws', 'submissions'].map((tab) => (
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
                    onClick={() => setShowDrawModal(true)}
                    className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all"
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
                      <button
                        onClick={() => handleDeleteDraw(selectedDraw.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                        onClick={() => setShowProductModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all"
                      >
                        Add Product
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No products. Add one!</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-white font-medium">{product.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">{product.description || 'No description'}</p>
                                <p className="text-emerald-400 font-semibold mt-2">${product.retail_price}</p>
                              </div>
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
                              <th className="pb-3 font-medium">Email</th>
                              <th className="pb-3 font-medium">Name</th>
                              <th className="pb-3 font-medium">Date</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {submissions.map((sub) => (
                              <tr key={sub.id}>
                                <td className="py-3 text-white">{sub.user_email}</td>
                                <td className="py-3 text-slate-300">{sub.user_name || '-'}</td>
                                <td className="py-3 text-slate-400 text-sm">
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

        {activeTab === 'submissions' && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">All Submissions</h2>
            <p className="text-slate-500 text-center py-8">
              Select a draw from the "Draws" tab to view its submissions.
            </p>
          </div>
        )}
      </main>

      {/* Create Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Create New Draw</h2>
            </div>
            <form onSubmit={handleCreateDraw} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={drawForm.title}
                  onChange={(e) => setDrawForm({ ...drawForm, title: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={drawForm.description}
                  onChange={(e) => setDrawForm({ ...drawForm, description: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={drawForm.image_url}
                  onChange={(e) => setDrawForm({ ...drawForm, image_url: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Entry Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={drawForm.entry_fee}
                    onChange={(e) => setDrawForm({ ...drawForm, entry_fee: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={drawForm.status}
                    onChange={(e) => setDrawForm({ ...drawForm, status: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDrawModal(false)}
                  className="px-6 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all"
                >
                  Create Draw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Add Product to "{selectedDraw?.title}"</h2>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Retail Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.retail_price}
                  onChange={(e) => setProductForm({ ...productForm, retail_price: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


