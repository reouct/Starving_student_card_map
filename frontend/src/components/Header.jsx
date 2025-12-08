import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, isAdmin, logout } from "../utils/auth";

export default function Header({ onSearch, isMobile, onToggleDeals }) {
  const loggedIn = isLoggedIn();
  const navigate = useNavigate?.();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate && navigate("/login");
  }

  const navLinks = (
    <>
      {!loggedIn && (
        <>
          <Link
            to="/login"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#3b82f6",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Login
          </Link>
          <Link
            to="/admin/login"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#1f2937",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Admin
          </Link>
          <Link
            to="/register"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Register
          </Link>
        </>
      )}
      {loggedIn && (
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}
      {loggedIn && isAdmin() && (
        <Link
          to="/admin/deals"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "#1f2937",
            color: "#fff",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          Manage Deals
        </Link>
      )}
    </>
  );

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            Starving Student Map
          </div>
        </Link>
        {!isMobile && (
          <div style={{ color: "#666", fontSize: 13 }}>
            Digital version of your Starving Student Card
          </div>
        )}
      </div>

      {!isMobile ? (
        <div>
          <input
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search restaurants or deals"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
          />
          <div style={{ display: "inline-flex", gap: 8, marginLeft: 12 }}>
            {navLinks}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ☰
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                width: "100%",
                background: "#fff",
                borderBottom: "1px solid #eee",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                zIndex: 2000,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <button
                onClick={() => {
                  onToggleDeals?.();
                  setMenuOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "#f3f4f6",
                  color: "#000",
                  border: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                View Deals List
              </button>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
                onClick={() => setMenuOpen(false)}
              >
                {navLinks}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
