import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Users, Clock, ArrowRight, X } from 'lucide-react';
import MemberDashboard from '../components/MemberDashboard';
import ActivityFeed from '../components/ActivityFeed';
import { Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
        const res = await api.get('/projects/activities/recent');
        setActivities(res.data.data);
        setActivitiesLoading(false);
    } catch (err) {
        console.error(err);
        setActivitiesLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/projects/${selectedProject}/members`, { userId });
      fetchProjects();
      setShowMemberModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
      fetchRecentActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All tasks will be lost.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
      fetchRecentActivities();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading projects...</div>;

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Project Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of all your active workspaces</p>
        </div>
        
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={20} />
            New Project
          </button>
        )}
      </header>

      {user.role === 'member' && <MemberDashboard />}

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px' 
        }}>
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '-20px', 
              right: '-20px', 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              opacity: 0.1,
              borderRadius: '50%'
            }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                  <Briefcase size={20} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', flex: 1 }}>{project.name}</h3>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => handleDeleteProject(project._id)}
                    style={{ background: 'transparent', color: 'rgba(239, 68, 68, 0.5)', padding: '4px' }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6', height: '4.8em', overflow: 'hidden' }}>
              {project.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '20px'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Users size={16} />
                  <span>{project.members?.length || 0} Members</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Clock size={16} />
                  <span>Active</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => {
                      setSelectedProject(project._id);
                      fetchUsers();
                      setShowMemberModal(true);
                    }}
                    style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      color: 'var(--primary)', 
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    Manage Members
                  </button>
                )}
                <button 
                    onClick={() => navigate(`/project/${project._id}`)}
                    style={{ 
                    background: 'transparent', 
                    color: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                    }}
                >
                    Open <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No projects found</h3>
            <p>Get started by creating your first project.</p>
          </div>
        )}
      </div>

      <aside style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 120px)' }}>
          <ActivityFeed activities={activities} loading={activitiesLoading} />
      </aside>
    </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card"
              style={{ width: '90%', maxWidth: '500px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Create New Project</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateProject}>
                <div className="input-group">
                  <label>Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Website Redesign"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Project goals and details..."
                    rows="4"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    required 
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Create Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Members Modal */}
      <AnimatePresence>
        {showMemberModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card"
              style={{ width: '90%', maxWidth: '450px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Manage Team Members</h2>
                <button onClick={() => setShowMemberModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {allUsers.map(u => {
                    const isAlreadyMember = projects.find(p => p._id === selectedProject)?.members.some(m => m._id === u._id);
                    return (
                        <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>{u.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                            {isAlreadyMember ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Member</span>
                            ) : (
                                <button 
                                    onClick={() => addMember(u._id)}
                                    style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    );
                })}
                {allUsers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No other members found.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
