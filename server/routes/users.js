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
