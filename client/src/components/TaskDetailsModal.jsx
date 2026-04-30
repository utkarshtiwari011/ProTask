import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, User, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const TaskDetailsModal = ({ task, onClose, onUpdate, onDelete }) => {
  const [comment, setComment] = useState('');
  const { user } = useContext(AuthContext);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await api.post(`/tasks/${task._id}/comment`, { text: comment });
      setComment('');
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task._id);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card"
        style={{ width: '90%', maxWidth: '700px', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ 
                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                    background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    color: task.priority === 'high' ? 'var(--error)' : 'var(--primary)',
                    textTransform: 'uppercase', fontWeight: '700'
                }}>{task.priority}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {task._id.slice(-6)}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{task.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user.role === 'admin' && (
              <button onClick={handleDelete} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '8px', borderRadius: '8px' }}>
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0' }}>
            <div style={{ padding: '24px', borderRight: '1px solid var(--glass-border)' }}>
                <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Description
                    </h3>
                    <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>{task.description}</p>
                </section>

                <section>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} /> Discussion ({task.comments?.length || 0})
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        {task.comments?.map((c, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', flexShrink: 0
                                }}>
                                    {c.user?.name[0] || '?'}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{c.user?.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{c.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ flex: 1, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
                            <Send size={18} />
                        </button>
                    </form>
                </section>
            </div>

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Assignee</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={18} color="var(--primary)" />
                            <span style={{ fontWeight: '600' }}>{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Due Date</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={18} color="var(--secondary)" />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={18} color="var(--warning)" />
                            <span style={{ textTransform: 'capitalize' }}>{task.status.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px' }}>
                        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Created on {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetailsModal;
