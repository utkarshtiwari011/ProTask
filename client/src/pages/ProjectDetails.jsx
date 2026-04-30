import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, MessageSquare, Clock, AlertCircle, 
  CheckCircle2, BarChart3, Filter, X, User as UserIcon
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import TeamPerformance from '../components/TeamPerformance';
import TaskDetailsModal from '../components/TaskDetailsModal';
import ActivityFeed from '../components/ActivityFeed';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', status: 'todo', priority: 'medium', project: id, dueDate: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, taskRes, actRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/projects/${id}/activities`)
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data);
      setActivities(actRes.data.data);
      setLoading(false);
      setActivitiesLoading(false);

      // Refresh selected task if it's open
      if (selectedTask) {
        const updatedTask = taskRes.data.data.find(t => t._id === selectedTask._id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActivitiesLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', project: id });
      setShowTaskModal(false);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setSelectedTask(null);
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading workspace...</div>;

  const chartData = {
    labels: ['Todo', 'In Progress', 'Done'],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'todo').length,
        tasks.filter(t => t.status === 'in-progress').length,
        tasks.filter(t => t.status === 'done').length,
      ],
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }],
  };

  const statusColumns = [
    { id: 'todo', title: 'To Do', icon: <Clock size={18} color="var(--primary)" /> },
    { id: 'in-progress', title: 'In Progress', icon: <Filter size={18} color="var(--warning)" /> },
    { id: 'done', title: 'Completed', icon: <CheckCircle2 size={18} color="var(--success)" /> }
  ];

  return (
    <div style={{ padding: '30px 0' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>{project?.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{project?.description}</p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)' }}>
            <button 
                onClick={() => setActiveTab('kanban')}
                style={{ 
                    padding: '10px 20px', 
                    background: 'transparent', 
                    color: activeTab === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'kanban' ? '2px solid var(--primary)' : 'none',
                    fontWeight: '600'
                }}
            >
                Kanban Board
            </button>
            {user.role === 'admin' && (
                <button 
                    onClick={() => setActiveTab('performance')}
                    style={{ 
                        padding: '10px 20px', 
                        background: 'transparent', 
                        color: activeTab === 'performance' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'performance' ? '2px solid var(--primary)' : 'none',
                        fontWeight: '600'
                    }}
                >
                    Team Performance
                </button>
            )}
            <button 
                onClick={() => setActiveTab('activity')}
                style={{ 
                    padding: '10px 20px', 
                    background: 'transparent', 
                    color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'activity' ? '2px solid var(--primary)' : 'none',
                    fontWeight: '600'
                }}
            >
                Activity Feed
            </button>
          </div>

          {activeTab === 'kanban' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {statusColumns.map(col => (
                <div key={col.id} className="kanban-column">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {col.icon}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{col.title}</h3>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                        {tasks.filter(t => t.status === col.id).length}
                        </span>
                    </div>
                    {user.role === 'admin' && col.id === 'todo' && (
                        <button onClick={() => setShowTaskModal(true)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px', borderRadius: '6px' }}>
                        <Plus size={18} />
                        </button>
                    )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
                    {tasks.filter(t => t.status === col.id).map(task => (
                        <motion.div
                        key={task._id}
                        layoutId={task._id}
                        className="glass-card"
                        style={{ padding: '16px', cursor: 'pointer' }}
                        onClick={() => setSelectedTask(task)}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: task.priority === 'high' ? 'var(--error)' : 'var(--primary)',
                            textTransform: 'uppercase',
                            fontWeight: '700'
                            }}>{task.priority}</span>
                            <select 
                            value={task.status} 
                            onChange={(e) => {
                                e.stopPropagation();
                                updateTaskStatus(task._id, e.target.value);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                            </select>
                        </div>

                        <h4 style={{ marginBottom: '8px', fontSize: '1rem' }}>{task.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{task.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <UserIcon size={14} />
                            <span>{task.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={14} />
                            <span style={{ fontSize: '0.8rem' }}>{task.comments?.length || 0}</span>
                            </div>
                        </div>
                        </motion.div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
          ) : activeTab === 'performance' ? (
            <TeamPerformance projectId={id} />
          ) : (
            <ActivityFeed activities={activities} loading={activitiesLoading} />
          )}
        </div>

        <aside style={{ position: 'sticky', top: '100px' }}>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Analytics</h3>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              <Pie 
                data={chartData} 
                options={{ 
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit' } } } },
                  maintainAspectRatio: false 
                }} 
              />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Team Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' }}>
                  {project?.admin?.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{project?.admin?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</div>
                </div>
              </div>
              {project?.members?.map(member => (
                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' }}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
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
                <h2 style={{ fontSize: '1.5rem' }}>Add New Task</h2>
                <button onClick={() => setShowTaskModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="input-group">
                  <label>Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Design Login Page"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Task details..."
                    rows="3"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    required                    
                  ></textarea>
                </div>
                <div className="input-group">
                    <label>Due Date</label>
                    <input 
                        type="date" 
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                        <label>Priority</label>
                        <select 
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Assign To</label>
                        <select 
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                        >
                            <option value="">Select Member</option>
                            <option value={project.admin._id}>{project.admin.name} (You)</option>
                            {project.members?.map(m => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Add Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
            <TaskDetailsModal 
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={fetchProjectAndTasks}
                onDelete={handleDeleteTask}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
