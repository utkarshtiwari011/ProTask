const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all users (for member selection)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'member' }).select('name email');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
// @desc    Get current user stats and project performance
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        // Find projects where user is a member
        const projects = await Project.find({ members: req.user.id });
        const projectIds = projects.map(p => p._id);

        // Find all accepted tasks assigned to the user
        const tasks = await Task.find({ 
            assignedTo: req.user.id, 
            assignmentStatus: 'accepted'
        }).populate('project', 'name');

        const doneCount = tasks.filter(t => t.status === 'done').length;
        const totalCount = tasks.length;
        const performance = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

        // Group specific tasks by project for the detailed view
        const detailedProjects = projects.map(p => {
            const projectTasks = tasks.filter(t => t.project && t.project._id.toString() === p._id.toString());
            const projectDone = projectTasks.filter(t => t.status === 'done').length;
            const projectPerformance = projectTasks.length > 0 ? Math.round((projectDone / projectTasks.length) * 100) : 0;
            
            return {
                _id: p._id,
                name: p.name,
                description: p.description,
                performance: projectPerformance,
                tasks: projectTasks.filter(t => t.status !== 'done').map(t => ({
                    _id: t._id,
                    title: t.title,
                    status: t.status,
                    priority: t.priority
                }))
            };
        });

        res.status(200).json({ 
            success: true, 
            data: {
                stats: {
                    performance,
                    inProgress: tasks.filter(t => t.status === 'in-progress').length,
                    todo: tasks.filter(t => t.status === 'todo').length,
                    done: doneCount,
                    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length
                },
                projects: detailedProjects
            } 
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get pending assignments for current user
// @route   GET /api/users/assignments
// @access  Private
router.get('/assignments', protect, async (req, res) => {
    try {
        const Task = require('../models/Task');
        const tasks = await Task.find({ 
            assignedTo: req.user.id, 
            assignmentStatus: 'pending' 
        }).populate('project', 'name');
        
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// @desc    Get performance of all members in a project
// @route   GET /api/users/project/:projectId/performance
// @access  Private (Admin only)
router.get('/project/:projectId/performance', protect, authorize('admin'), async (req, res) => {
    try {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        const project = await Project.findById(req.params.projectId).populate('members', 'name email');
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        const tasks = await Task.find({ project: req.params.projectId });

        const performanceData = project.members.map(member => {
            const memberTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === member._id.toString());
            const completed = memberTasks.filter(t => t.status === 'done').length;
            const total = memberTasks.length;
            
            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                totalTasks: total,
                completedTasks: completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });

        res.status(200).json({ success: true, data: performanceData });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
