import { Connection, User } from '../models/index.js';
import { Op } from 'sequelize';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.userId;
    const { receiverId, message } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-connection
    if (requesterId === parseInt(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send connection request to yourself'
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      where: {
        [Op.or]: [
          { requester_id: requesterId, receiver_id: receiverId },
          { requester_id: receiverId, receiver_id: requesterId }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists',
        data: { status: existingConnection.status }
      });
    }

    // Create connection request
    const connection = await Connection.create({
      requester_id: requesterId,
      receiver_id: receiverId,
      message: message || null,
      status: 'pending'
    });

    // Fetch the created connection with user details
    const connectionWithDetails = await Connection.findByPk(connection.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: connectionWithDetails
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request'
    });
  }
};

// Get connection status between two users
export const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      where: {
        [Op.or]: [
          { requester_id: currentUserId, receiver_id: userId },
          { requester_id: userId, receiver_id: currentUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name']
        }
      ]
    });

    if (!connection) {
      return res.json({
        success: true,
        data: {
          status: 'none',
          canMessage: false,
          canSendRequest: true
        }
      });
    }

    const isRequester = connection.requester_id === currentUserId;
    const canMessage = connection.status === 'accepted';
    const canSendRequest = connection.status === 'rejected';

    res.json({
      success: true,
      data: {
        status: connection.status,
        isRequester,
        canMessage,
        canSendRequest,
        connection
      }
    });
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status'
    });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId } = req.params;

    const connection = await Connection.findOne({
      where: {
        id: connectionId,
        receiver_id: userId,
        status: 'pending'
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or already processed'
      });
    }

    connection.status = 'accepted';
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connection
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection request'
    });
  }
};

// Reject connection request
export const rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId } = req.params;

    const connection = await Connection.findOne({
      where: {
        id: connectionId,
        receiver_id: userId,
        status: 'pending'
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or already processed'
      });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request rejected',
      data: connection
    });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject connection request'
    });
  }
};

// Get incoming connection requests
export const getIncomingConnectionRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const incomingRequests = await Connection.findAll({
      where: {
        receiver_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'bio', 'profession']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedRequests = incomingRequests.map(request => ({
      id: request.id,
      requester: request.requester,
      message: request.message,
      createdAt: request.created_at
    }));

    res.json({
      success: true,
      message: 'Incoming connection requests retrieved successfully',
      data: formattedRequests
    });
  } catch (error) {
    console.error('Error getting incoming connection requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get incoming connection requests'
    });
  }
};

// Get user's connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'accepted' } = req.query;

    const connections = await Connection.findAll({
      where: {
        [Op.or]: [
          { requester_id: userId },
          { receiver_id: userId }
        ],
        status
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'profession']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'profession']
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Format connections to show the other user
    const formattedConnections = connections.map(conn => {
      const otherUser = conn.requester_id === userId ? conn.receiver : conn.requester;
      return {
        id: conn.id,
        status: conn.status,
        message: conn.message,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at,
        isRequester: conn.requester_id === userId,
        user: otherUser
      };
    });

    res.json({
      success: true,
      data: formattedConnections
    });
  } catch (error) {
    console.error('Get user connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connections'
    });
  }
};
