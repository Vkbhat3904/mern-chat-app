import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ messageId }) => {
  const { authUser } = useAuthContext();
  const { messages, updateMessage: updateZustandMessage } = useConversation();

  // Get message from Zustand and memoize it
  const message = useMemo(
    () => messages.find((msg) => msg._id === messageId),
    [messages, messageId]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message?.message || "");

  // Sync edit content when message changes
  useEffect(() => {
    setEditContent(message?.message || "");
  }, [message?.message]);

  if (!message) return null; // message may be deleted already

  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const bubbleBgColor = fromMe ? "bg-blue-500" : "bg-gray-700";
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const shakeClass = message.shouldShake ? "shake" : "";

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      const { data: updatedMessage } = await axios.patch(
        `/api/messages/${message._id}`,
        { content: editContent }
      );

      updateZustandMessage({
        ...updatedMessage,
        isEdited: true,
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Edit failed:", err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`/api/messages/${message._id}`);
      // The socket event will handle the Zustand update (removal)
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  const messageKey = `${message._id}-${message.updatedAt || message.createdAt}`;

  return (
    <div key={messageKey} className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full"></div>
      </div>

      <div
        className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} relative pb-6`}
      >
        {isEditing ? (
          <div className="flex flex-col">
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-black px-2 py-1 rounded"
              autoFocus
            />
            <div className="mt-1 flex gap-2 text-xs">
              <button
                onClick={handleUpdate}
                className="text-green-300 hover:text-green-400"
                disabled={editContent.trim() === message.message}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-300 hover:text-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>{message.message}</p>
            {message.isEdited && (
              <span className="text-xs ml-1 opacity-70">(edited)</span>
            )}
          </>
        )}

        {fromMe && !isEditing && (
          <div className="absolute bottom-1 right-2 flex gap-2 text-xs text-white opacity-80 hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="hover:text-yellow-300 transition text-l"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              onClick={handleDelete}
              className="hover:text-red-500 text-red-300 transition text-l"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>

      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formattedTime}
      </div>
    </div>
  );
};

export default Message;
