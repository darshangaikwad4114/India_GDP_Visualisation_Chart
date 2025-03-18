import React from "react";
import "./Header.css";

function Header() {
    return (
        <header className="header">
            <nav className="navbar navbar-expand">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="navbar-brand-wrapper d-flex align-items-center">
                        <div className="navbar-logo me-3">
                            <i className="bi bi-bar-chart-fill"></i>
                        </div>
                        <div className="navbar-title">India's GDP Dashboard</div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;