import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, BarChart } from 'lucide-react';

const TeamPerformance = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, [projectId]);

  const fetchPerformance = async () => {
    try {
      const res = await api.get(`/users/project/${projectId}/performance`);
      setMembers(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading performance data...</div>;

  return (
    <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <BarChart size={24} color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Team Progress & Contributions</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {members.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '16px', 
              padding: '20px',
              border: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontWeight: 'bold', fontSize: '1.1rem'
                }}>
                  {member.name[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{member.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.email}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>{member.progress}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Progress</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{member.totalTasks}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="var(--success)" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{member.completedTasks}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed</div>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${member.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '4px'
                }}
              />
            </div>
          </motion.div>
        ))}

        {members.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No team members assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;
