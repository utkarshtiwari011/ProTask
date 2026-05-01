import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Target, Award, Calendar, Inbox, Check, X
} from 'lucide-react';

const MemberDashboard = () => {
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const [statsRes, assignmentsRes] = await Promise.all([
        api.get(`/users/stats?t=${timestamp}`),
        api.get(`/users/assignments?t=${timestamp}`)
      ]);
      setData(statsRes.data.data);
      setAssignments(assignmentsRes.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}/assignment`, { status });
      fetchData(); // Refresh everything
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update assignment');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reports...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', marginBottom: '30px' }}>Dashboard Error: {error}. Please refresh or contact an administrator.</div>;
  if (!data) return null;

  const { stats, projects } = data;

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
        gap: '20px',
        marginBottom: '30px'
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

      {assignments.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '30px', borderLeft: '4px solid var(--secondary)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                <Inbox size={20} /> Pending Assignments ({assignments.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignments.map(task => (
                    <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '1.1rem' }}>{task.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Project: <span style={{ color: 'white' }}>{task.project.name}</span> • Priority: {task.priority}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => handleAssignment(task._id, 'accepted')}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
                            >
                                <Check size={16} /> Accept
                            </button>
                            <button 
                                onClick={() => handleAssignment(task._id, 'rejected')}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
                            >
                                <X size={16} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="var(--primary)" /> Ongoing Projects & Tasks
            </h3>
            {projects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You are not currently assigned to any projects.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {projects.map(project => (
                        <div key={project._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{project.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Project Efficiency: <strong style={{ color: 'var(--success)' }}>{project.performance}%</strong></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px' }}>
                                    Active Contributor
                                </div>
                            </div>
                            
                            {project.tasks.length > 0 ? (
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Current To-Do List</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {project.tasks.map(task => (
                                            <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{task.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: task.priority === 'high' ? 'var(--error)' : 'var(--text-muted)' }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No active tasks for you right now.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                border: '4px solid var(--primary)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}>
                {stats.performance}%
            </div>
            <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Efficiency Score</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Great job! You are performing better than 85% of team members this month. Keep completing tasks to raise your score.
            </p>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
