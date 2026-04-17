import React, { useMemo, useRef, useState } from 'react';
import {
    RiCalendarCheckLine,
    RiMailLine,
    RiMapPinLine,
    RiPhoneLine,
    RiShieldUserLine,
    RiUploadCloud2Line,
    RiDeleteBinLine,
    RiEdit2Line,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { resolveUploadUrl } from '../../utils/url';

const ProfileSettings = ({ user, onRefresh, onEditProfile }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const currentImageUrl = useMemo(() => {
        const image = user?.profileImage || user?.avatar;
        if (!image || image === 'default-avatar.png') return '';
        return resolveUploadUrl(image) || '';
    }, [user?.profileImage, user?.avatar]);

    const shownImage = previewUrl || currentImageUrl;

    const onSelectImage = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be 2MB or smaller');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!selectedFile) {
            toast.error('Please choose an image first');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profileImage', selectedFile);
            await api.put('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Profile image saved');
            setSelectedFile(null);
            setPreviewUrl('');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async () => {
        setRemoving(true);
        try {
            await api.put('/users/upload-avatar', { remove: true });
            toast.success('Profile image removed');
            setSelectedFile(null);
            setPreviewUrl('');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not remove image');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="settings-content-stack">
            <div className="settings-panel-card">
                <div className="settings-panel-header">
                    <h3 className="settings-panel-title">Profile</h3>
                    <p className="settings-panel-subtitle">Profile details and photo</p>
                </div>

                <div className="settings-profile-top">
                    <div className="settings-profile-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                        {shownImage ? (
                            <img src={shownImage} alt="Profile" className="settings-profile-avatar" />
                        ) : (
                            <div className="settings-profile-avatar-fallback">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="settings-profile-meta">
                        <h4>{user?.name || '-'}</h4>
                        <p>{user?.email || '-'}</p>
                        <span className="med-cat-badge">{(user?.role || 'pharmacist').toUpperCase()}</span>
                    </div>

                    <div className="settings-profile-actions">
                        <button className="settings-btn settings-btn--ghost" type="button" onClick={onEditProfile}>
                            <RiEdit2Line />
                            <span>Edit Profile</span>
                        </button>
                        <button className="settings-btn settings-btn--primary" type="button" onClick={uploadImage} disabled={!selectedFile || uploading}>
                            <RiUploadCloud2Line />
                            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                        </button>
                        <button className="settings-btn settings-btn--danger" type="button" onClick={removeImage} disabled={removing}>
                            <RiDeleteBinLine />
                            <span>{removing ? 'Removing...' : 'Remove Image'}</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onSelectImage}
                        />
                    </div>
                </div>
            </div>

            <div className="settings-panel-card">
                <div className="settings-profile-details-grid">
                    <div className="settings-profile-detail-item"><RiMailLine /><span><strong>Email:</strong> {user?.email || '-'}</span></div>
                    <div className="settings-profile-detail-item"><RiPhoneLine /><span><strong>Phone:</strong> {user?.phone || '-'}</span></div>
                    <div className="settings-profile-detail-item"><RiMapPinLine /><span><strong>Address:</strong> {user?.address || '-'}</span></div>
                    <div className="settings-profile-detail-item"><RiShieldUserLine /><span><strong>Role:</strong> {(user?.role || '-').toUpperCase()}</span></div>
                    <div className="settings-profile-detail-item"><RiCalendarCheckLine /><span><strong>Created On:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;

