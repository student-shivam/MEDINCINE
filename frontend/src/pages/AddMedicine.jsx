import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    RiAddLine,
    RiArrowLeftLine,
    RiDeleteBin7Line,
    RiEditLine,
    RiImageAddLine,
    RiRefreshLine,
    RiSaveLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../services/api';

const AddMedicine = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [uploadPreview, setUploadPreview] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [quickCategoryName, setQuickCategoryName] = useState('');
    const [quickSubCategoryName, setQuickSubCategoryName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        manufacturer: '',
        batchNumber: '',
        categoryId: '',
        subcategoryId: '',
        brand: '',
        price: '',
        stock: '',
        lowStockThreshold: 10,
        expiryDate: '',
        supplier: '',
        description: '',
        image: null,
    });

    const [categoryForm, setCategoryForm] = useState({ name: '', editingId: '' });
    const [subCategoryForm, setSubCategoryForm] = useState({ name: '', categoryId: '', editingId: '' });
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [subCategoryLoading, setSubCategoryLoading] = useState(false);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data || [];
        },
    });

    const { data: allSubcategories = [] } = useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
            const res = await api.get('/subcategories');
            return res.data.data || [];
        },
    });

    const filteredSubcategories = useMemo(
        () => allSubcategories.filter((sub) => String(sub.categoryId?._id || sub.categoryId) === formData.categoryId),
        [allSubcategories, formData.categoryId]
    );

    const managedSubcategories = useMemo(
        () => allSubcategories.filter((sub) => String(sub.categoryId?._id || sub.categoryId) === subCategoryForm.categoryId),
        [allSubcategories, subCategoryForm.categoryId]
    );

    const refreshCategoryData = () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Medicine name is required';
        if (!formData.categoryId) errors.categoryId = 'Category is required';
        if (!formData.brand.trim()) errors.brand = 'Brand name is required';
        if (formData.price === '' || Number(formData.price) < 0) errors.price = 'Valid price is required';
        if (formData.stock === '' || Number(formData.stock) < 0) errors.stock = 'Valid stock is required';
        if (formData.lowStockThreshold === '' || Number(formData.lowStockThreshold) < 0) errors.lowStockThreshold = 'Min stock cannot be negative';
        if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
        if (!formData.supplier.trim()) errors.supplier = 'Supplier is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        if (name === 'image') {
            const file = files?.[0];
            if (!file) {
                setFormData((prev) => ({ ...prev, image: null }));
                setUploadPreview('');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image must be 2MB or smaller');
                return;
            }

            setFormData((prev) => ({ ...prev, image: file }));
            setUploadPreview(URL.createObjectURL(file));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'categoryId' ? { subcategoryId: '' } : {}),
        }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name.trim());
            if (formData.genericName) payload.append('genericName', formData.genericName.trim());
            if (formData.manufacturer || formData.brand) payload.append('manufacturer', (formData.manufacturer || formData.brand).trim());
            if (formData.batchNumber) payload.append('batchNumber', formData.batchNumber.trim());
            payload.append('categoryId', formData.categoryId);
            if (formData.subcategoryId) payload.append('subcategoryId', formData.subcategoryId);
            payload.append('brand', formData.brand.trim());
            payload.append('price', Number(formData.price));
            payload.append('stock', Number(formData.stock));
            payload.append('quantity', Number(formData.stock));
            payload.append('lowStockThreshold', Number(formData.lowStockThreshold));
            payload.append('expiryDate', formData.expiryDate);
            payload.append('supplier', formData.supplier.trim());
            payload.append('description', formData.description.trim());
            if (formData.image) payload.append('image', formData.image);

            await api.post('/medicines', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Medicine saved successfully');
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            navigate('/admin/medicines');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save medicine');
        } finally {
            setSaving(false);
        }
    };

    const saveCategory = async (event) => {
        event.preventDefault();
        const name = categoryForm.name.trim();
        if (!name) {
            toast.error('Category name is required');
            return;
        }

        setCategoryLoading(true);
        try {
            if (categoryForm.editingId) {
                await api.put(`/categories/${categoryForm.editingId}`, { name });
                toast.success('Category updated');
            } else {
                await api.post('/categories', { name });
                toast.success('Category added');
            }
            setCategoryForm({ name: '', editingId: '' });
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save category');
        } finally {
            setCategoryLoading(false);
        }
    };

    const editCategory = (category) => {
        setCategoryForm({ name: category.name, editingId: category._id });
    };

    const removeCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            if (formData.categoryId === id) {
                setFormData((prev) => ({ ...prev, categoryId: '', subcategoryId: '' }));
            }
            if (subCategoryForm.categoryId === id) {
                setSubCategoryForm({ name: '', categoryId: '', editingId: '' });
            }
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not delete category');
        }
    };

    const saveSubCategory = async (event) => {
        event.preventDefault();
        const name = subCategoryForm.name.trim();
        if (!name || !subCategoryForm.categoryId) {
            toast.error('Subcategory name and category are required');
            return;
        }

        setSubCategoryLoading(true);
        try {
            const payload = { name, categoryId: subCategoryForm.categoryId };
            if (subCategoryForm.editingId) {
                await api.put(`/subcategories/${subCategoryForm.editingId}`, payload);
                toast.success('Subcategory updated');
            } else {
                await api.post('/subcategories', payload);
                toast.success('Subcategory added');
            }
            setSubCategoryForm((prev) => ({ ...prev, name: '', editingId: '' }));
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save subcategory');
        } finally {
            setSubCategoryLoading(false);
        }
    };

    const handleQuickAddCategory = async () => {
        const name = quickCategoryName.trim();
        if (!name) {
            toast.error('Category name is required');
            return;
        }
        setCategoryLoading(true);
        try {
            await api.post('/categories', { name });
            toast.success('Category added');
            setQuickCategoryName('');
            setShowCategoryModal(false);
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save category');
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleQuickAddSubCategory = async () => {
        const name = quickSubCategoryName.trim();
        if (!formData.categoryId) {
            toast.error('Select a category first');
            return;
        }
        if (!name) {
            toast.error('Subcategory name is required');
            return;
        }
        setSubCategoryLoading(true);
        try {
            await api.post('/subcategories', { name, categoryId: formData.categoryId });
            toast.success('Subcategory added');
            setQuickSubCategoryName('');
            setShowSubCategoryModal(false);
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save subcategory');
        } finally {
            setSubCategoryLoading(false);
        }
    };

    const editSubCategory = (sub) => {
        setSubCategoryForm({
            name: sub.name,
            editingId: sub._id,
            categoryId: String(sub.categoryId?._id || sub.categoryId),
        });
    };

    const removeSubCategory = async (id) => {
        if (!window.confirm('Delete this subcategory?')) return;
        try {
            await api.delete(`/subcategories/${id}`);
            toast.success('Subcategory deleted');
            if (formData.subcategoryId === id) {
                setFormData((prev) => ({ ...prev, subcategoryId: '' }));
            }
            refreshCategoryData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not delete subcategory');
        }
    };

    return (
        <div className="med-page fade-in">
            <div className="med-header-premium">
                <button onClick={() => navigate(-1)} className="back-btn-premium" type="button">
                    <RiArrowLeftLine size={24} />
                </button>
                <div className="med-header-text">
                    <h1 className="med-title-premium">Add Medicine</h1>
                    <p className="med-subtitle-premium">Create medicine records with category and image details</p>
                </div>
            </div>

            <div className="add-medicine-layout">
                <div className="premium-form-card add-med-card">
                    <form onSubmit={handleSubmit} className="add-medicine-form">
                        <div className="add-med-card-header">
                            <div>
                                <h3 className="add-med-section-title">Medicine Details</h3>
                                <p className="add-med-section-subtitle">Structured, balanced form designed for fast pharmacy entry.</p>
                            </div>
                        </div>

                        <div className="add-med-field-grid">
                            <div className="med-form-group">
                                <label>Medicine Name *</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Paracetamol 650" />
                                {formErrors.name && <span className="profile-form-error">{formErrors.name}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Generic Name</label>
                                <input name="genericName" value={formData.genericName} onChange={handleChange} placeholder="Acetaminophen" />
                            </div>

                            <div className="med-form-group">
                                <label>Manufacturer / Brand *</label>
                                <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Cipla" />
                                {formErrors.brand && <span className="profile-form-error">{formErrors.brand}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Batch Number</label>
                                <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch / Lot No." />
                            </div>

                            <div className="med-form-group">
                                <label>Category *</label>
                                <div className="inline-add-field">
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="inline-add-btn"
                                        onClick={() => setShowCategoryModal(true)}
                                        aria-label="Add category"
                                    >
                                        +
                                    </button>
                                </div>
                                {formErrors.categoryId && <span className="profile-form-error">{formErrors.categoryId}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Subcategory</label>
                                <div className="inline-add-field">
                                    <select
                                        name="subcategoryId"
                                        value={formData.subcategoryId}
                                        onChange={handleChange}
                                        disabled={!formData.categoryId}
                                    >
                                        <option value="">Select subcategory</option>
                                        {filteredSubcategories.map((sub) => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="inline-add-btn"
                                        onClick={() => {
                                            if (!formData.categoryId) {
                                                toast.error('Select a category first');
                                                return;
                                            }
                                            setShowSubCategoryModal(true);
                                        }}
                                        aria-label="Add subcategory"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="med-form-group">
                                <label>Price *</label>
                                <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" />
                                {formErrors.price && <span className="profile-form-error">{formErrors.price}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Stock Quantity *</label>
                                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="0" />
                                {formErrors.stock && <span className="profile-form-error">{formErrors.stock}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Minimum Stock</label>
                                <input
                                    name="lowStockThreshold"
                                    type="number"
                                    min="0"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                    placeholder="10"
                                />
                                {formErrors.lowStockThreshold && <span className="profile-form-error">{formErrors.lowStockThreshold}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Expiry Date *</label>
                                <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
                                {formErrors.expiryDate && <span className="profile-form-error">{formErrors.expiryDate}</span>}
                            </div>

                            <div className="med-form-group">
                                <label>Supplier *</label>
                                <input name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier name" />
                                {formErrors.supplier && <span className="profile-form-error">{formErrors.supplier}</span>}
                            </div>

                            <div className="add-med-image-block">
                                <label className="add-med-image-preview tiny clickable" htmlFor="medicineImage">
                                    {uploadPreview ? (
                                        <img src={uploadPreview} alt="Preview" />
                                    ) : (
                                        <span className="add-med-upload-placeholder">Upload Image</span>
                                    )}
                                </label>
                                <input id="medicineImage" name="image" type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
                            </div>

                            <div className="med-form-group add-med-desc-group full-span">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Usage, dosage, and precautions"
                                />
                            </div>
                        </div>

                        <div className="premium-form-footer right">
                            <button type="button" className="premium-btn ghost" onClick={() => navigate('/admin/medicines')}>
                                Cancel
                            </button>
                            <button type="submit" className="premium-btn primary" disabled={saving}>
                                <RiSaveLine size={18} />
                                <span>{saving ? 'Saving...' : 'Save Medicine'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                <div className="add-med-side-panels">
                    <div className="premium-form-card add-med-manage-card">
                        <h3 className="add-med-section-title">Category Management</h3>
                        <form className="add-med-inline-form" onSubmit={saveCategory}>
                            <input
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Category name"
                            />
                            <button className="premium-btn primary" type="submit" disabled={categoryLoading}>
                                <RiAddLine size={16} />
                                <span>{categoryForm.editingId ? 'Update' : 'Add'}</span>
                            </button>
                            {categoryForm.editingId && (
                                <button
                                    className="premium-btn ghost"
                                    type="button"
                                    onClick={() => setCategoryForm({ name: '', editingId: '' })}
                                >
                                    <RiRefreshLine size={16} />
                                    <span>Reset</span>
                                </button>
                            )}
                        </form>

                        <div className="add-med-chip-list">
                            {categories.map((cat) => (
                                <div className="add-med-chip-item" key={cat._id}>
                                    <span>{cat.name}</span>
                                    <div className="add-med-chip-actions">
                                        <button type="button" onClick={() => editCategory(cat)}><RiEditLine /></button>
                                        <button type="button" onClick={() => removeCategory(cat._id)}><RiDeleteBin7Line /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-form-card add-med-manage-card">
                        <h3 className="add-med-section-title">Subcategory Management</h3>
                        <form className="add-med-inline-form add-med-inline-form-stack" onSubmit={saveSubCategory}>
                            <select
                                value={subCategoryForm.categoryId}
                                onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <input
                                value={subCategoryForm.name}
                                onChange={(e) => setSubCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Subcategory name"
                            />
                            <div className="add-med-inline-actions">
                                <button className="premium-btn primary" type="submit" disabled={subCategoryLoading}>
                                    <RiAddLine size={16} />
                                    <span>{subCategoryForm.editingId ? 'Update' : 'Add'}</span>
                                </button>
                                {subCategoryForm.editingId && (
                                    <button
                                        className="premium-btn ghost"
                                        type="button"
                                        onClick={() => setSubCategoryForm((prev) => ({ ...prev, name: '', editingId: '' }))}
                                    >
                                        <RiRefreshLine size={16} />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="add-med-chip-list">
                            {managedSubcategories.map((sub) => (
                                <div className="add-med-chip-item" key={sub._id}>
                                    <span>{sub.name}</span>
                                    <div className="add-med-chip-actions">
                                        <button type="button" onClick={() => editSubCategory(sub)}><RiEditLine /></button>
                                        <button type="button" onClick={() => removeSubCategory(sub._id)}><RiDeleteBin7Line /></button>
                                    </div>
                                </div>
                            ))}
                            {subCategoryForm.categoryId && managedSubcategories.length === 0 && (
                                <p className="add-med-empty-note">No subcategories yet for this category</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCategoryModal && (
                <div className="mini-modal">
                    <div className="mini-modal-card">
                        <h4>Add Category</h4>
                        <input
                            autoFocus
                            value={quickCategoryName}
                            onChange={(e) => setQuickCategoryName(e.target.value)}
                            placeholder="Category name"
                        />
                        <div className="mini-modal-actions">
                            <button type="button" className="premium-btn ghost" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                            <button type="button" className="premium-btn primary" onClick={handleQuickAddCategory} disabled={categoryLoading}>
                                {categoryLoading ? 'Saving...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSubCategoryModal && (
                <div className="mini-modal">
                    <div className="mini-modal-card">
                        <h4>Add Subcategory</h4>
                        <p className="mini-modal-hint">
                            Category: {categories.find((c) => c._id === formData.categoryId)?.name || ''}
                        </p>
                        <input
                            autoFocus
                            value={quickSubCategoryName}
                            onChange={(e) => setQuickSubCategoryName(e.target.value)}
                            placeholder="Subcategory name"
                        />
                        <div className="mini-modal-actions">
                            <button type="button" className="premium-btn ghost" onClick={() => setShowSubCategoryModal(false)}>Cancel</button>
                            <button type="button" className="premium-btn primary" onClick={handleQuickAddSubCategory} disabled={subCategoryLoading}>
                                {subCategoryLoading ? 'Saving...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMedicine;
