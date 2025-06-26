import { useEffect, useState, useCallback } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const getMessages = useCallback(async () => {
    if (!selectedConversation?._id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${selectedConversation._id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Ensure new array reference for Zustand to detect changes
      setMessages([...data]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation?._id, setMessages]);

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  return { messages, loading, refetch: getMessages };
};

export default useGetMessages;

// import { useEffect, useState } from "react";
// import useConversation from "../zustand/useConversation";
// import toast from "react-hot-toast";

// const useGetMessages = () => {
// 	const [loading, setLoading] = useState(false);
// 	const { messages, setMessages, selectedConversation } = useConversation();

// 	useEffect(() => {
// 		const getMessages = async () => {
// 			setLoading(true);
// 			try {
// 				const res = await fetch(`/api/messages/${selectedConversation._id}`);
// 				const data = await res.json();
// 				if (data.error) throw new Error(data.error);
// 				setMessages(data);
// 			} catch (error) {
// 				toast.error(error.message);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		if (selectedConversation?._id) getMessages();
// 	}, [selectedConversation?._id, setMessages]);

// 	return { messages, loading };
// };
// export default useGetMessages;
