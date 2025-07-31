import { Meeting, User } from '../models/index.js';
import { Op } from 'sequelize';

// Schedule a meeting
export const scheduleMeeting = async (req, res) => {
  try {
    const organizerId = req.userId;
    const {
      participantId,
      title,
      description,
      scheduledAt,
      duration,
      meetingType,
      meetingLink,
      agenda
    } = req.body;

    // Check if participant exists
    const participant = await User.findByPk(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Create meeting
    const meeting = await Meeting.create({
      organizer_id: organizerId,
      participant_id: participantId,
      title,
      description,
      meeting_date: scheduledAt,
      duration_minutes: duration || 60, // Default 60 minutes
      meeting_type: meetingType || 'online',
      meeting_link: meetingLink,
      notes: Array.isArray(agenda) ? agenda.join('\n') : agenda,
      status: 'pending',
      organizer_timezone: 'UTC', // TODO: Get from user profile
      participant_timezone: 'UTC' // TODO: Get from user profile
    });

    // Fetch meeting with user details
    const meetingWithUsers = await Meeting.findByPk(meeting.id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        }
      ]
    });

    // TODO: Send email notifications to both users
    // TODO: Create Google Calendar events

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: meetingWithUsers
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule meeting'
    });
  }
};

// Get user's meetings
export const getUserMeetings = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {
      [Op.or]: [
        { organizer_id: userId },
        { participant_id: userId }
      ]
    };

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    // Add type filter
    if (type) {
      whereClause.meeting_type = type;
    }

    const meetings = await Meeting.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        }
      ],
      limit,
      offset,
      order: [['meeting_date', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        meetings: meetings.rows,
        pagination: {
          total: meetings.count,
          page,
          pages: Math.ceil(meetings.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings'
    });
  }
};

// Get single meeting
export const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [
          { organizer_id: userId },
          { participant_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'full_name', 'email', 'profile_picture', 'timezone']
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'full_name', 'email', 'profile_picture', 'timezone']
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or you do not have access to this meeting'
      });
    }

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting'
    });
  }
};

// Update meeting
export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;
    const {
      title,
      description,
      scheduledAt,
      duration,
      meetingType,
      meetingLink,
      agenda,
      status
    } = req.body;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        organizer_id: userId // Only organizer can update meeting
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or you do not have permission to update this meeting'
      });
    }

    await meeting.update({
      title,
      description,
      meeting_date: scheduledAt,
      duration_minutes: duration,
      meeting_type: meetingType,
      meeting_link: meetingLink,
      notes: Array.isArray(agenda) ? agenda.join('\n') : agenda,
      status
    });

    // Fetch updated meeting with user details
    const updatedMeeting = await Meeting.findByPk(meetingId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting'
    });
  }
};

// Cancel meeting
export const cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;
    const { reason } = req.body;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [
          { organizer_id: userId },
          { participant_id: userId }
        ]
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or you do not have access to this meeting'
      });
    }

    await meeting.update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: userId,
      cancelled_at: new Date()
    });

    // TODO: Send cancellation notifications
    // TODO: Remove from Google Calendar

    res.json({
      success: true,
      message: 'Meeting cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel meeting'
    });
  }
};

// Accept meeting invitation
export const acceptMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        participant_id: userId,
        status: 'pending'
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or already responded to'
      });
    }

    await meeting.update({
      status: 'confirmed',
      confirmed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Meeting accepted successfully'
    });
  } catch (error) {
    console.error('Accept meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept meeting'
    });
  }
};

// Decline meeting invitation
export const declineMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;
    const { reason } = req.body;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        participant_id: userId,
        status: 'pending'
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or already responded to'
      });
    }

    await meeting.update({
      status: 'declined',
      decline_reason: reason,
      declined_at: new Date()
    });

    res.json({
      success: true,
      message: 'Meeting declined successfully'
    });
  } catch (error) {
    console.error('Decline meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline meeting'
    });
  }
};

// Mark meeting as completed
export const completeMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.userId;
    const { notes } = req.body;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [
          { organizer_id: userId },
          { participant_id: userId }
        ],
        status: 'confirmed'
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or cannot be marked as completed'
      });
    }

    await meeting.update({
      status: 'completed',
      notes: notes
    });

    res.json({
      success: true,
      message: 'Meeting marked as completed'
    });
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark meeting as completed'
    });
  }
};
