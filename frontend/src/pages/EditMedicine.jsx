import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    RiArrowLeftLine,
    RiImageAddLine,
    RiSaveLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../services/api';

const EditMedicine = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [uploadPreview, setUploadPreview] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        subcategoryId: '',
        brand: '',
        batchNumber: '',
        expiryDate: '',
        purchasePrice: '',
        sellingPrice: '',
        stock: '',
        supplier: '',
        description: '',
        image: null,
    });

    const { data: medicine, isLoading } = useQuery({
        queryKey: ['medicine', id],
        queryFn: async () => {
            const res = await api.get(`/medicines/${id}`);
            return res.data.data;
        },
        enabled: Boolean(id),
    });

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

    const getMedicineImage = (med) => {
        const candidate = med?.image || med?.imageUrl || med?.medicineImage || med?.photo;
        if (!candidate) return '';
        if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;

        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
        if (candidate.startsWith('/uploads/')) {
            return `${baseUrl}${candidate}`;
        }
        return `${baseUrl}/uploads/${candidate}`;
    };

    useEffect(() => {
        if (!medicine) return;

        const categoryId = String(medicine.categoryId?._id || medicine.categoryId || '');
        const subcategoryId = String(medicine.subcategoryId?._id || medicine.subcategoryId || '');
        const priceValue = medicine.price ?? medicine.unitPrice ?? medicine.sellingPrice ?? '';
        const stockValue = medicine.stock ?? medicine.quantity ?? '';

        setFormData({
            name: medicine.name || '',
            categoryId,
            subcategoryId,
            brand: medicine.brand || medicine.manufacturer || '',
            batchNumber: medicine.batchNumber || '',
            expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
            purchasePrice: medicine.purchasePrice ?? '',
            sellingPrice: priceValue,
            stock: stockValue,
            supplier: medicine.supplier || '',
            description: medicine.description || '',
            image: null,
        });

        setCurrentImage(getMedicineImage(medicine));
    }, [medicine]);

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Medicine name is required';
        if (!formData.categoryId) errors.categoryId = 'Category is required';
        if (!formData.brand.trim()) errors.brand = 'Brand is required';
        if (formData.sellingPrice === '' || Number(formData.sellingPrice) < 0) errors.sellingPrice = 'Valid selling price is required';
        if (formData.stock === '' || Number(formData.stock) < 0) errors.stock = 'Valid stock is required';
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
            payload.append('categoryId', formData.categoryId);
            if (formData.subcategoryId) payload.append('subcategoryId', formData.subcategoryId);
            payload.append('brand', formData.brand.trim());
            payload.append('batchNumber', formData.batchNumber.trim());
            payload.append('expiryDate', formData.expiryDate);
            payload.append('supplier', formData.supplier.trim());
            payload.append('description', formData.description.trim());
            payload.append('price', Number(formData.sellingPrice));
            payload.append('sellingPrice', Number(formData.sellingPrice));
            payload.append('stock', Number(formData.stock));
            if (formData.purchasePrice !== '') payload.append('purchasePrice', Number(formData.purchasePrice));
            if (formData.image) payload.append('image', formData.image);

            await api.put(`/medicines/${id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Medicine updated successfully');
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            queryClient.invalidateQueries({ queryKey: ['medicine', id] });
            navigate('/admin/medicines');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not update medicine');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading && !medicine) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading medicine...</p>
            </div>
        );
    }

    return (
        <div className="med-page fade-in">
            <div className="med-header-premium">
                <button onClick={() => navigate(-1)} className="back-btn-premium" type="button">
                    <RiArrowLeftLine size={24} />
                </button>
                <div className="med-header-text">
                    <h1 className="med-title-premium">Edit Medicine</h1>
                    <p className="med-subtitle-premium">Update medicine details, pricing, and stock.</p>
                </div>
            </div>

            <div className="add-medicine-layout edit-medicine-layout">
                <div className="premium-form-card">
                    <form onSubmit={handleSubmit} className="add-medicine-form">
                        <section className="add-med-section">
                            <h3 className="add-med-section-title">Basic Information</h3>
                            <div className="med-modal-grid">
                                <div className="med-form-group">
                                    <label>Medicine Name *</label>
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Paracetamol 650" />
                                    {formErrors.name && <span className="profile-form-error">{formErrors.name}</span>}
                                </div>

                                <div className="med-form-group">
                                    <label>Brand / Manufacturer *</label>
                                    <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Cipla" />
                                    {formErrors.brand && <span className="profile-form-error">{formErrors.brand}</span>}
                                </div>

                                <div className="med-form-group">
                                    <label>Category *</label>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.categoryId && <span className="profile-form-error">{formErrors.categoryId}</span>}
                                </div>

                                <div className="med-form-group">
                                    <label>Subcategory</label>
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
                                </div>

                                <div className="med-form-group">
                                    <label>Batch Number</label>
                                    <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch number" />
                                </div>
                            </div>
                        </section>

                        <section className="add-med-section">
                            <h3 className="add-med-section-title">Pricing and Stock</h3>
                            <div className="med-modal-grid">
                                <div className="med-form-group">
                                    <label>Purchase Price</label>
                                    <input
                                        name="purchasePrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.purchasePrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="med-form-group">
                                    <label>Selling Price *</label>
                                    <input
                                        name="sellingPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                    {formErrors.sellingPrice && <span className="profile-form-error">{formErrors.sellingPrice}</span>}
                                </div>

                                <div className="med-form-group">
                                    <label>Stock Quantity *</label>
                                    <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="0" />
                                    {formErrors.stock && <span className="profile-form-error">{formErrors.stock}</span>}
                                </div>
                            </div>
                        </section>

                        <section className="add-med-section">
                            <h3 className="add-med-section-title">Supplier and Details</h3>
                            <div className="med-modal-grid">
                                <div className="med-form-group">
                                    <label>Supplier *</label>
                                    <input name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier name" />
                                    {formErrors.supplier && <span className="profile-form-error">{formErrors.supplier}</span>}
                                </div>

                                <div className="med-form-group">
                                    <label>Expiry Date *</label>
                                    <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
                                    {formErrors.expiryDate && <span className="profile-form-error">{formErrors.expiryDate}</span>}
                                </div>

                                <div className="med-form-group add-med-desc-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Usage, dosage, and precautions"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="add-med-section">
                            <h3 className="add-med-section-title">Medicine Image</h3>
                            <div className="add-med-image-row">
                                <label className="add-med-image-picker" htmlFor="medicineEditImage">
                                    <RiImageAddLine size={20} />
                                    <span>{formData.image ? 'Replace Image' : 'Change Image'}</span>
                                </label>
                                <input id="medicineEditImage" name="image" type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
                                <div className="add-med-image-preview">
                                    {uploadPreview ? (
                                        <img src={uploadPreview} alt="Preview" />
                                    ) : currentImage ? (
                                        <img src={currentImage} alt="Current" />
                                    ) : (
                                        <span>No image available</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="premium-form-footer">
                            <button type="button" className="premium-btn ghost" onClick={() => navigate('/admin/medicines')}>
                                Cancel
                            </button>
                            <button type="submit" className="premium-btn primary" disabled={saving}>
                                <RiSaveLine size={18} />
                                <span>{saving ? 'Saving...' : 'Update Medicine'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMedicine;
