const express = require('express');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Project.find({ admin: req.user.id });
    } else {
      query = Project.find({ members: req.user.id });
    }

    const projects = await query.populate('admin', 'name email').populate('members', 'name email');

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if user is project admin or member
    if (
      project.admin.toString() !== req.user.id &&
      !project.members.some((m) => m._id.toString() === req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this project' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Add user to req.body
    req.body.admin = req.user.id;

    const project = await Project.create(req.body);

    // Log Activity
    await Activity.create({
      user: req.user.id,
      project: project._id,
      type: 'project_created',
      description: `created project "${project.name}"`,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Make sure user is project admin
    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
router.post('/:id/members', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if user is project admin
    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to manage members' });
    }

    if (project.members.includes(req.body.userId)) {
      return res.status(400).json({ success: false, error: 'User already in project' });
    }

    project.members.push(req.body.userId);
    await project.save();

    // Log Activity
    const newMember = await User.findById(req.body.userId);
    await Activity.create({
      user: req.user.id,
      project: project._id,
      type: 'member_added',
      description: `added ${newMember.name} to the project`,
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Make sure user is project admin
    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this project' });
    }

    await project.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get project activities
// @route   GET /api/projects/:id/activities
// @access  Private
router.get('/:id/activities', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get user's global activities
// @route   GET /api/projects/activities/recent
// @access  Private
router.get('/activities/recent', protect, async (req, res) => {
  try {
    // For admins, show activities of their projects. For members, show activities of projects they are in.
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ admin: req.user.id });
    } else {
      projects = await Project.find({ members: req.user.id });
    }

    const projectIds = projects.map(p => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(15);

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
