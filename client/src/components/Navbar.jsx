import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Layout, LogOut, User as UserIcon, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar glass-card" style={{ 
      margin: '20px auto', 
      maxWidth: '1200px', 
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 1000
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '8px',
          borderRadius: '10px'
        }}>
          <Layout size={24} color="white" />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          PRO<span style={{ color: 'var(--primary)' }}>TASK</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
          <UserIcon size={18} color="var(--text-muted)" />
          <span style={{ fontWeight: '500' }}>{user.name}</span>
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '2px 8px', 
            borderRadius: '20px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>{user.role}</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'transparent', 
            color: 'var(--error)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
