import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, CheckCircle, Trash2, UserPlus, 
  Settings, MessageSquare, Clock 
} from 'lucide-react';

const ActivityFeed = ({ activities, loading }) => {
  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading activities...</div>;

  const getIcon = (type) => {
    switch (type) {
      case 'task_created': return <PlusCircle size={16} color="var(--primary)" />;
      case 'task_updated': return <CheckCircle size={16} color="var(--success)" />;
      case 'task_deleted': return <Trash2 size={16} color="var(--error)" />;
      case 'member_added': return <UserPlus size={16} color="var(--secondary)" />;
      case 'project_created': return <Settings size={16} color="var(--primary)" />;
      default: return <Clock size={16} color="var(--text-muted)" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="glass-card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={20} color="var(--primary)" /> Recent Activity
      </h3>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map((activity, index) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '10px', 
              background: 'rgba(255,255,255,0.03)', display: 'flex', 
              justifyContent: 'center', alignItems: 'center', flexShrink: 0 
            }}>
              {getIcon(activity.type)}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{activity.user?.name}</span>{' '}
                {activity.description}
                {activity.project && activity.project.name && (
                    <span style={{ color: 'var(--text-muted)' }}> in {activity.project.name}</span>
                )}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(activity.createdAt)}</span>
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
