import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to send message
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    data.newMessage,
                ]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Subscribe to new messages
    const subscribeToMessages = () => {
        if (!socket) return;

        // Prevent duplicate listeners
        socket.off("newMessage");

        socket.on("newMessage", async (newMessage) => {
            console.log("Received Message:", newMessage);

            if (
                selectedUser &&
                String(newMessage.senderId) === String(selectedUser._id)
            ) {
                newMessage.seen = true;

                setMessages((prevMessages) => [
                    ...prevMessages,
                    newMessage,
                ]);

                try {
                    await axios.put(`/api/messages/mark/${newMessage._id}`);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]:
                        (prevUnseenMessages[newMessage.senderId] || 0) + 1,
                }));
            }
        });
    };

    // Unsubscribe
    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
        }
    };

    useEffect(() => {
        subscribeToMessages();

        return () => {
            unsubscribeFromMessages();
        };
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};