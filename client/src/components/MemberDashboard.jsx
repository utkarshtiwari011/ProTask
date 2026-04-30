import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { 
  ClipboardList, RefreshCw, CheckSquare, AlertTriangle, 
  Check, X
} from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useContext(AuthContext);
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
      const [statsRes, assignmentsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/assignments')
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

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '20px', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>Dashboard Error: {error}</div>;
  if (!data) return null;

  const { stats, projects } = data;

  const statCards = [
    { 
      label: 'Total Tasks', 
      value: stats.todo + stats.inProgress + stats.done, 
      icon: <ClipboardList size={24} color="#f59e0b" />,
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      icon: <RefreshCw size={24} color="#3b82f6" />,
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    { 
      label: 'Completed', 
      value: stats.done, 
      icon: <CheckSquare size={24} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      label: 'High Priority', 
      value: stats.highPriority, 
      icon: <AlertTriangle size={24} color="#ef4444" />,
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  // Flatten active tasks from projects for the table
  const activeTasks = projects.flatMap(p => p.tasks.map(t => ({...t, project: p})));
  const allTableItems = [...assignments, ...activeTasks];

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Good morning, {user?.name || 'Member'}!</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {statCards.map((card, index) => (
          <div key={index} className="flat-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '10px', 
              background: card.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)', lineHeight: '1' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flat-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Recent Tasks</h3>
          <button style={{ 
            background: 'transparent', border: '1px solid var(--glass-border)', 
            color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' 
          }}>
            View All &rarr;
          </button>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>TASK</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>PROJECT</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>PRIORITY</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>STATUS / ACTION</th>
              </tr>
            </thead>
            <tbody>
              {allTableItems.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No tasks yet. Create a project and add tasks!
                  </td>
                </tr>
              ) : (
                allTableItems.map(item => {
                  const isPending = item.assignmentStatus === 'pending';
                  
                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{item.title}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{item.project?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                          background: item.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                          color: item.priority === 'high' ? 'var(--error)' : 'var(--text-muted)'
                        }}>
                          {item.priority.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAssignment(item._id, 'accepted')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                              <Check size={14} /> Accept
                            </button>
                            <button onClick={() => handleAssignment(item._id, 'rejected')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '500' }}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
