import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Target, Award, Calendar
} from 'lucide-react';

const MemberDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (!data) return null;

  const { stats } = data;

  const statCards = [
    { 
      label: 'Performance', 
      value: `${stats.performance}%`, 
      icon: <Award size={24} color="var(--secondary)" />,
      desc: 'Based on task completion'
    },
    { 
      label: 'Active Tasks', 
      value: stats.inProgress + stats.todo, 
      icon: <Target size={24} color="var(--primary)" />,
      desc: 'Work currently assigned'
    },
    { 
      label: 'Completed', 
      value: stats.done, 
      icon: <CheckCircle2 size={24} color="var(--success)" />,
      desc: 'Lifetime contributions'
    },
    { 
      label: 'High Priority', 
      value: stats.highPriority, 
      icon: <AlertCircle size={24} color="var(--error)" />,
      desc: 'Urgent attention required'
    }
  ];

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <TrendingUp size={24} color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>My Performance Report</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                {card.icon}
              </div>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700', 
                background: 'linear-gradient(135deg, white, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {card.value}
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{card.label}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="var(--primary)" /> Ongoing Contributions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.projects.map(project => (
                    <div key={project._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{project.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role: Contributor</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>
                                Active
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                border: '4px solid var(--primary)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}>
                {stats.performance}%
            </div>
            <h3 style={{ marginBottom: '8px' }}>Efficiency Score</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You are performing better than 85% of team members this month!
            </p>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
