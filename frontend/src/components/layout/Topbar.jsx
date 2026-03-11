import React from 'react';
import {
    RiNotification3Line,
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Topbar = () => {
    const navigate = useNavigate();

    // Fetch user info for the topbar
    const { data: apiUser } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response.data.data;
            } catch {
                return null;
            }
        }
    });

    // Fallback to localStorage user if API user is not yet available
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = apiUser || localUser;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const profileImage = user?.profileImage || user?.avatar;
    const avatarUrl = profileImage && profileImage !== 'default-avatar.png'
        ? `${baseUrl.replace('/api', '')}/uploads/${profileImage}`
        : null;

    return (
        <header className="topbar">
            <div className="topbar-left" />

            <div className="topbar-right">
                <button className="icon-btn" type="button">
                    <RiNotification3Line size={20} />
                </button>

                <button type="button" className="user-profile-trigger" onClick={() => navigate('/profile')}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="user-avatar-small" />
                    ) : (
                        <div className="user-avatar-fallback">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Topbar;
