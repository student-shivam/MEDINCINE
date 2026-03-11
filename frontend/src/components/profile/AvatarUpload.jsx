import React, { useEffect, useRef, useState } from 'react';
import { RiCameraLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AvatarUpload = ({ imageUrl, fallbackName, onUploaded }) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const displayImage = previewUrl || imageUrl;

    useEffect(() => () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    const handleFileSelect = async (event) => {
        if (uploading) return;
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            event.target.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be 2MB or smaller');
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadError('');
        await handleUpload(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleUpload = async (file = selectedFile) => {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profileImage', file);
            const response = await api.put('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Profile image updated');
            setSelectedFile(null);
            setUploadError('');
            if (typeof onUploaded === 'function') {
                onUploaded(response.data?.data);
            }
        } catch (error) {
            const message = error.response?.data?.error || 'Image upload failed. Please try again.';
            toast.error(message);
            setPreviewUrl('');
            setSelectedFile(null);
            setUploadError(message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="profile-avatar-panel">
            <div
                className="profile-avatar-wrap"
                onClick={() => !uploading && fileInputRef.current?.click()}
                aria-label="Update profile picture"
            >
                {displayImage ? (
                    <img src={displayImage} alt="Profile" className="profile-avatar-image" />
                ) : (
                    <div className="profile-avatar-fallback">
                        {(fallbackName || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="profile-avatar-overlay">
                    <div className="avatar-camera-badge">
                        <RiCameraLine size={18} />
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            {uploading && <span className="avatar-status">Uploading...</span>}
            {uploadError && <span className="avatar-error">{uploadError}</span>}
        </div>
    );
};

export default AvatarUpload;
