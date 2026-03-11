import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Pill } from 'lucide-react';

const Welcome = () => {
    return (
        <div style={containerStyle}>
            {/* Abstract Background Shapes */}
            <div style={blob1Style}></div>
            <div style={blob2Style}></div>

            <div style={cardStyle}>
                <div style={headerStyle}>
                    <div style={iconBoxStyle}>
                        <Pill size={40} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={titleStyle}>Medicine <span style={{ color: 'var(--primary)', opacity: 0.8 }}>Pro</span></h1>
                    <p style={subtitleStyle}>Simple medicine stock and billing management</p>
                </div>

                <div style={optionsStyle}>
                    <Link to="/login" style={buttonStylePrimary}>
                        <LogIn size={20} />
                        <span>Login</span>
                    </Link>

                    <Link to="/signup" style={buttonStyleSecondary}>
                        <UserPlus size={20} />
                        <span>Create Account</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
};

const blob1Style = {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '40vw',
    height: '40vw',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    zIndex: 0,
};

const blob2Style = {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    zIndex: 0,
};

const cardStyle = {
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    padding: '4rem 3rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-premium)',
    width: '100%',
    maxWidth: '520px',
    textAlign: 'center',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const headerStyle = {
    marginBottom: '3.5rem',
};

const iconBoxStyle = {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    width: '84px',
    height: '84px',
    borderRadius: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 2rem',
    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
    transform: 'rotate(-5deg)',
};

const titleStyle = {
    fontSize: '2.75rem',
    fontWeight: '900',
    color: 'var(--text-main)',
    margin: '0',
    letterSpacing: '-1.5px',
};

const subtitleStyle = {
    color: 'var(--text-muted)',
    fontSize: '1.125rem',
    fontWeight: '500',
    margin: '1rem 0 0',
    lineHeight: '1.6',
    maxWidth: '320px',
    marginInline: 'auto',
};

const optionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
};

const buttonStyleBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '1.125rem',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'var(--transition)',
};

const buttonStylePrimary = {
    ...buttonStyleBase,
    background: 'linear-gradient(to right, var(--primary), var(--primary-dark))',
    color: 'white',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
};

const buttonStyleSecondary = {
    ...buttonStyleBase,
    backgroundColor: 'white',
    color: 'var(--text-main)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-subtle)',
};

export default Welcome;
