const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const task = await Task.create(req.body);

    // Log Activity
    await Activity.create({
      user: req.user.id,
      project: req.body.project,
      type: 'task_created',
      description: `created task "${task.title}"`,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Update task (status/assignedTo/etc)
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Admins can update everything, members can only update status
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
        // Check if member is part of the project
        const project = await Project.findById(task.project);
        if (!project.members.includes(req.user.id)) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this task' });
        }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log Activity if status changed
    if (req.body.status) {
      await Activity.create({
        user: req.user.id,
        project: task.project,
        type: 'task_updated',
        description: `updated status of "${task.title}" to ${req.body.status}`,
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    task.comments.push(comment);
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await Activity.create({
      user: req.user.id,
      project: task.project,
      type: 'task_deleted',
      description: `deleted task "${task.title}"`,
    });

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
