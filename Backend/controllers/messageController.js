import { Message, User, Connection } from '../models/index.js';
import { Op } from 'sequelize';
// import { io } from '../server.js'; // Temporarily disabled to avoid circular import

// Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);
    console.log('User ID from auth:', req.userId);

    const senderId = req.userId;
    const { receiverId, content, messageType = 'text' } = req.body;

    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);
    console.log('Content:', content);

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if users are connected
    const connection = await Connection.findOne({
      where: {
        [Op.or]: [
          { requester_id: senderId, receiver_id: receiverId },
          { requester_id: receiverId, receiver_id: senderId }
        ],
        status: 'accepted'
      }
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: 'You must be connected to send messages. Please send a connection request first.'
      });
    }

    // Create conversation ID
    const conversationId = [senderId, receiverId].sort().join('_');

    // Create message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type: messageType,
      is_read: false
    });

    // Fetch message with sender details
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'profile_picture']
        }
      ]
    });

    // Emit real-time message (temporarily disabled)
    // const conversationId = [senderId, receiverId].sort().join('_');
    // io.to(`conversation_${conversationId}`).emit('new_message', messageWithSender);
    // io.to(`user_${receiverId}`).emit('message_notification', {
    //   senderId,
    //   senderName: messageWithSender.sender.full_name,
    //   message: content,
    //   conversationId
    // });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        ...messageWithSender.toJSON(),
        created_at: messageWithSender.created_at?.toISOString(),
        updated_at: messageWithSender.updated_at?.toISOString()
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'profile_picture']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    // Format dates properly for all messages
    const formattedMessages = messages.rows.reverse().map(message => ({
      ...message.toJSON(),
      created_at: message.created_at?.toISOString(),
      updated_at: message.updated_at?.toISOString(),
      read_at: message.read_at?.toISOString()
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          total: messages.count,
          page,
          pages: Math.ceil(messages.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all unique conversation partners
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'profile_picture', 'is_online', 'last_seen']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'profile_picture', 'is_online', 'last_seen']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Group conversations by partner
    const conversationMap = new Map();

    conversations.forEach(message => {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const partner = message.sender_id === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages
      if (message.receiver_id === userId && !message.is_read) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    // Format dates properly for conversations
    const conversationList = Array.from(conversationMap.values()).map(conversation => ({
      ...conversation,
      lastMessage: conversation.lastMessage ? {
        ...conversation.lastMessage.toJSON(),
        created_at: conversation.lastMessage.created_at?.toISOString(),
        updated_at: conversation.lastMessage.updated_at?.toISOString()
      } : null
    }));

    res.json({
      success: true,
      data: conversationList
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { senderId } = req.body;

    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: senderId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await Message.findOne({
      where: {
        id: messageId,
        sender_id: userId // Only sender can delete their message
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete this message'
      });
    }

    await message.destroy();

    // Emit real-time message deletion
    // const conversationId = [message.sender_id, message.receiver_id].sort().join('_');
    // io.to(`conversation_${conversationId}`).emit('message_deleted', { messageId });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { query, partnerId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereClause = {
      [Op.or]: [
        { sender_id: userId },
        { receiver_id: userId }
      ],
      content: { [Op.iLike]: `%${query}%` }
    };

    // Filter by specific conversation partner
    if (partnerId) {
      whereClause[Op.or] = [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId }
      ];
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'profile_picture']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Format dates properly for search results
    const formattedMessages = messages.rows.map(message => ({
      ...message.toJSON(),
      created_at: message.created_at?.toISOString(),
      updated_at: message.updated_at?.toISOString(),
      read_at: message.read_at?.toISOString()
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          total: messages.count,
          page,
          pages: Math.ceil(messages.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
};
