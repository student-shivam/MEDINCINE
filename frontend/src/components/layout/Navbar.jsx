import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Pill, PlusCircle, LogOut } from "lucide-react";
import { clearAuthSession } from "../../utils/auth";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuthSession();
        navigate("/login");
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.leftSection}>
                <h2 style={styles.logo}>Medicine</h2>

                <div style={styles.links}>
                    <NavLink to="/dashboard" style={navLinkStyle}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/medicines" style={navLinkStyle}>
                        <Pill size={18} />
                        Medicines
                    </NavLink>

                    <NavLink to="/add-medicine" style={navLinkStyle}>
                        <PlusCircle size={18} />
                        Add Medicine
                    </NavLink>
                </div>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={18} />
                Logout
            </button>
        </nav>
    );
};

const navLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
    color: isActive ? "#ffffff" : "#475569",
    backgroundColor: isActive ? "#2563eb" : "transparent",
});

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        height: "70px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
    },
    leftSection: {
        display: "flex",
        alignItems: "center",
        gap: "40px",
    },
    logo: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "700",
        color: "#2563eb",
        letterSpacing: "0.5px",
    },
    links: {
        display: "flex",
        gap: "10px",
    },
    logoutBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #fee2e2",
        background: "#fff1f2",
        color: "#dc2626",
        cursor: "pointer",
        fontWeight: 500,
        transition: "all 0.2s ease",
    },
};

export default Navbar;
