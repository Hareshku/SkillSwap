import { Contact, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// Submit a contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create contact submission
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        created_at: contact.created_at
      }
    });
  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again.',
      error: error.message
    });
  }
};

// Get all contact submissions (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const contacts = await Contact.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        contacts: contacts.rows,
        pagination: {
          total: contacts.count,
          page,
          pages: Math.ceil(contacts.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
};

// Get a specific contact submission (Admin only)
export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByPk(contactId, {
      include: [
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission'
    });
  }
};

// Update contact status and add admin response (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, priority, admin_response } = req.body;
    const adminId = req.userId;

    const contact = await Contact.findByPk(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_response) {
      updateData.admin_response = admin_response;
      updateData.responded_at = new Date();
      updateData.responded_by = adminId;
    }

    await contact.update(updateData);

    // Fetch updated contact with responder info
    const updatedContact = await Contact.findByPk(contactId, {
      include: [
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: updatedContact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission'
    });
  }
};

// Delete a contact submission (Admin only)
export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByPk(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission'
    });
  }
};

// Get contact statistics (Admin only)
export const getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.count();
    const pendingContacts = await Contact.count({ where: { status: 'pending' } });
    const resolvedContacts = await Contact.count({ where: { status: 'resolved' } });
    const urgentContacts = await Contact.count({ where: { priority: 'urgent' } });

    // Get contacts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Contact.findAll({
      where: {
        created_at: {
          [Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        totalContacts,
        pendingContacts,
        resolvedContacts,
        urgentContacts,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};