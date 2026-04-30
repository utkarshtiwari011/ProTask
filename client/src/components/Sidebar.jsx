import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Folder, CheckSquare, LogOut, ChevronUp } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '#', icon: <Folder size={20} /> },
    { name: 'All Tasks', path: '#', icon: <CheckSquare size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '30px 24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>Task Manager</h2>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                color: isActive ? (item.name === 'Dashboard' ? '#f472b6' : item.name === 'Projects' ? '#facc15' : '#4ade80') : 'inherit'
              }}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ 
        padding: '24px 20px', 
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'var(--primary)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontWeight: 'bold', fontSize: '1.1rem'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.2' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
