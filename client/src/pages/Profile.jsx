import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Award, Target, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setStats(res.data.data.stats);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>User Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account and view your performance</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        {/* User Info Card */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card" 
            style={{ padding: '32px', textAlign: 'center' }}
        >
          <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              margin: '0 auto 24px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '3rem', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
          }}>
            {user.name[0]}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'capitalize' }}>
            <Shield size={14} style={{ marginRight: '6px' }} /> {user.role}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="var(--primary)" />
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                    <div style={{ fontSize: '0.9rem' }}>{user.email}</div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="var(--secondary)" />
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</div>
                    <div style={{ fontSize: '0.9rem' }}>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card" 
                style={{ padding: '32px' }}
            >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award size={24} color="var(--warning)" /> Performance Overview
                </h3>

                {loading ? (
                    <p>Loading stats...</p>
                ) : stats ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{stats.done}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks Completed</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '4px' }}>{stats.performance}%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Efficiency Rate</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>{stats.inProgress + stats.todo}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Tasks</div>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--error)' }}>Could not load stats. Please try again later.</p>
                )}
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card" 
                style={{ padding: '32px' }}
            >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target size={24} color="var(--primary)" /> Skills & Badges
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {['Fast Responder', 'Problem Solver', 'Team Player', 'Detail Oriented'].map(tag => (
                        <span key={tag} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '600' }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
