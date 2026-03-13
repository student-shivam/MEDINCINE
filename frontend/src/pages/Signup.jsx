import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockPasswordLine, RiUserLine, RiShieldUserLine, RiMedicineBottleFill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { getDashboardPathByRole, setAuthSession } from '../utils/auth';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // role will always be pharmacist; it is not exposed in the form
        role: 'pharmacist',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            nextErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
            nextErrors.email = 'Enter a valid email address';
        }

        if (!formData.password) {
            nextErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            nextErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
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
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };
            // use the more semantically named /signup route (alias of /register)
            const response = await api.post('/auth/signup', payload);
            const { token, data } = response.data;

            // log the user in immediately after creating the account
            setAuthSession({ token, user: data });
            const redirectPath = getDashboardPathByRole(data?.role);
            toast.success('Account created successfully');
            navigate(redirectPath, { replace: true });
        } catch (error) {
            const message = error.response?.data?.error || 'Signup failed';
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
                        <div className="auth-icon-box auth-icon-box--green">
                            <RiMedicineBottleFill size={34} color="white" />
                        </div>
                        <h1 className="auth-title">Medicine Inventory System</h1>
                        <p className="auth-subtitle">Create your account to start managing inventory.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <RiUserLine className="input-icon" size={20} />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className={`auth-input ${errors.name ? 'auth-input--error' : ''}`}
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.name && <p className="field-error">{errors.name}</p>}
                        </div>

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
                                    placeholder="Minimum 6 characters"
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

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <RiLockPasswordLine className="input-icon" size={20} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="auth-visibility-btn"
                                    onClick={() => setShowConfirm((prev) => !prev)}
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirm ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                        </div>


                        <button type="submit" className="auth-button auth-button--green" disabled={loading}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link className="auth-link" to="/login">Go to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

