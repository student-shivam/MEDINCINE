import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockPasswordLine, RiMedicineBottleFill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getDashboardPathByRole, getStoredUser, isAuthenticated, setAuthSession } from '../utils/auth';
import '../styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isAuthenticated()) {
            const user = getStoredUser();
            navigate(getDashboardPathByRole(user?.role), { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const nextErrors = {};
        const email = formData.email.trim();
        const password = formData.password;

        if (!email) {
            nextErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            nextErrors.email = 'Enter a valid email address';
        }

        if (!password) {
            nextErrors.password = 'Password is required';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            const { token, data } = response.data;

            setAuthSession({ token, user: data });

            const redirectPath = getDashboardPathByRole(data?.role);
            toast.success('Welcome back');
            navigate(redirectPath, { replace: true });
        } catch (error) {
            const message = error.response?.data?.error || 'Wrong Email or Password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-icon-box">
                            <RiMedicineBottleFill size={34} color="white" />
                        </div>
                        <h1 className="auth-title">Medicine Inventory System</h1>
                        <p className="auth-subtitle">Manage your pharmacy inventory efficiently.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <div className="input-wrapper">
                                <RiMailLine className="input-icon" size={20} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                                    placeholder="name@hospital.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <RiLockPasswordLine className="input-icon" size={20} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="auth-visibility-btn"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Need an account? <Link className="auth-link" to="/signup">Go to Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
