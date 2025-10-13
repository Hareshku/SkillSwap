import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDate, getRelativeTime } from "../utils/dateUtils";
import OnlineStatusIndicator from "../components/OnlineStatusIndicator";

const Messages = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (partnerId) => {
    try {
      const response = await axios.get(
        `/api/messages/conversation/${partnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/api/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await axios.post(
        "/api/messages",
        {
          receiverId: selectedConversation.partner.id,
          content: newMessage.trim(),
          messageType: "text",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage("");
      // Refresh messages and conversations
      await Promise.all([
        fetchMessages(selectedConversation.partner.id),
        fetchConversations(),
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (senderId) => {
    try {
      await axios.put(
        "/api/messages/mark-read",
        {
          senderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Select a conversation
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.partner.id);

    // Mark messages as read
    if (conversation.unreadCount > 0) {
      await markAsRead(conversation.partner.id);
      await fetchConversations();
      await fetchUnreadCount();
    }
  };

  // Navigate to user profile
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConversations(), fetchUnreadCount()]);
      setLoading(false);
    };

    loadData();
  }, [token]);

  // Auto-open conversation if user data is passed from UserProfile
  useEffect(() => {
    const openConversationWith = location.state?.openConversationWith;
    if (openConversationWith && !loading) {
      // Find existing conversation with this user
      const existingConversation = conversations.find(
        (conv) => conv.partner.id === parseInt(openConversationWith.id)
      );

      if (existingConversation) {
        // Open existing conversation
        setSelectedConversation(existingConversation);
        fetchMessages(existingConversation.partner.id);
      } else {
        // Create new conversation object for display
        const newConversation = {
          partner: {
            id: parseInt(openConversationWith.id),
            full_name: openConversationWith.full_name,
            profile_picture: openConversationWith.profile_picture,
          },
          lastMessage: null,
          unreadCount: 0,
        };
        setSelectedConversation(newConversation);
        setMessages([]); // Start with empty messages
      }

      // Clear the state to prevent re-opening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [conversations, location.state, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No conversations yet.</p>
                    <p className="text-sm mt-2">
                      Connect with other users to start messaging!
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.partner.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.partner.id ===
                        conversation.partner.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(conversation.partner.id);
                          }}
                          className="flex-shrink-0 relative hover:opacity-80 transition-opacity"
                          title="Click to view profile"
                        >
                          {conversation.partner.profile_picture ? (
                            <img
                              src={conversation.partner.profile_picture}
                              alt={conversation.partner.full_name}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
                              <span className="text-gray-600 font-medium">
                                {conversation.partner.full_name?.charAt(0) ||
                                  "?"}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <OnlineStatusIndicator
                              isOnline={conversation.partner.is_online}
                            />
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(conversation.partner.id);
                              }}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate text-left cursor-pointer hover:underline"
                              title="Click to view profile"
                            >
                              {conversation.partner.full_name}
                            </button>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content ||
                              "No messages yet"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getRelativeTime(
                              conversation.lastMessage?.created_at
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          handleViewProfile(selectedConversation.partner.id)
                        }
                        className="relative hover:opacity-80 transition-opacity"
                        title="Click to view profile"
                      >
                        {selectedConversation.partner.profile_picture ? (
                          <img
                            src={selectedConversation.partner.profile_picture}
                            alt={selectedConversation.partner.full_name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
                            <span className="text-gray-600 font-medium">
                              {selectedConversation.partner.full_name?.charAt(
                                0
                              ) || "?"}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <OnlineStatusIndicator
                            isOnline={selectedConversation.partner.is_online}
                          />
                        </div>
                      </button>
                      <div>
                        <button
                          onClick={() =>
                            handleViewProfile(selectedConversation.partner.id)
                          }
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                          title="Click to view profile"
                        >
                          {selectedConversation.partner.full_name}
                        </button>
                        <div className="flex items-center space-x-1">
                          <OnlineStatusIndicator
                            isOnline={selectedConversation.partner.is_online}
                          />
                          <span className="text-sm text-gray-500">
                            {selectedConversation.partner.is_online
                              ? "Online"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id ===
                            selectedConversation.partner.id
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id ===
                              selectedConversation.partner.id
                                ? "bg-gray-200 text-gray-900"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id ===
                                selectedConversation.partner.id
                                  ? "text-gray-500"
                                  : "text-blue-100"
                              }`}
                            >
                              {formatDate(message.created_at, "time")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={2000}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {sendingMessage ? "Sending..." : "Send"}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-lg">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
