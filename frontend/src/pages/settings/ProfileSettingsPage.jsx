import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RiArrowLeftLine, RiSaveLine, RiUploadCloud2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';
import '../../styles/settings.css';

const ProfileSettingsPage = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['profile-summary'],
        queryFn: async () => {
            const response = await api.get('/users/profile-summary');
            const user = response.data.data.user;
            setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
            return user;
        },
    });

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const currentImage = useMemo(() => {
        const image = data?.profileImage || data?.avatar;
        if (!image || image === 'default-avatar.png') return '';
        return `${baseUrl.replace('/api', '')}/uploads/${image}`;
    }, [data?.profileImage, data?.avatar, baseUrl]);

    const imageSrc = previewUrl || currentImage;

    const onFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const onSave = async (event) => {
        event.preventDefault();
        if (!form.name.trim()) {
            toast.error('Admin name is required');
            return;
        }
        if (!form.email.trim()) {
            toast.error('Email is required');
            return;
        }
        if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
            toast.error('Enter a valid mobile number');
            return;
        }

        setSaving(true);
        try {
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('profileImage', selectedFile);
                await api.put('/users/upload-avatar', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await api.put('/users/update-profile', { name: form.name.trim(), phone: form.phone.trim() });
            await api.put('/auth/profile', { name: form.name.trim(), email: form.email.trim() });

            toast.success('Profile updated');
            setSelectedFile(null);
            setPreviewUrl('');
            queryClient.invalidateQueries({ queryKey: ['profile-summary'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save profile');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="settings-route-page">
            <div className="settings-route-head">
                <Link to="/settings" className="settings-route-back"><RiArrowLeftLine /> Back</Link>
                <div>
                    <h1>Profile Settings</h1>
                    <p>Manage your admin profile information.</p>
                </div>
            </div>

            <div className="settings-route-card">
                <form className="settings-route-form" onSubmit={onSave}>
                    <div className="settings-route-avatar">
                        <div className="settings-route-avatar-preview" onClick={() => fileInputRef.current?.click()}>
                            {imageSrc ? (
                                <img src={imageSrc} alt="Profile" />
                            ) : (
                                <span>{(form.name || 'A').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onFileChange}
                        />
                        <button type="button" className="settings-btn settings-btn--ghost" onClick={() => fileInputRef.current?.click()}>
                            <RiUploadCloud2Line />
                            <span>Upload Image</span>
                        </button>
                    </div>

                    <div className="settings-route-fields">
                        <div className="settings-form-group">
                            <label>Admin Name</label>
                            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="settings-form-group">
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div className="settings-form-group">
                            <label>Mobile Number</label>
                            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                        </div>
                    </div>

                    <div className="settings-actions-row">
                        <button type="submit" className="settings-btn settings-btn--primary" disabled={saving}>
                            <RiSaveLine />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
