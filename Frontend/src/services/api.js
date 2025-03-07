import Axios from "axios";
import { BASE_URL } from "../config/config";
import dummyData from "../data/dummyData.json";

const URL = `${BASE_URL}`;

const urlChats = `${URL}/chats`;
const urlChat = `${URL}/chat`;

// Function to post a query with specified parameters
export async function postQuery({
  query,
  chat_name,
  debug_test = true,
  verbose = true,
}) {
  try {
    const response = await Axios.post(`${URL}/query`, {
      query,
      chat_name,
      debug_test,
      verbose,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to post query");
  }
}

// Function to send a chat message
export async function sendChatMessage({ userId, message }) {
  try {
    const response = await Axios.post(urlChat, {
      userId,
      message,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
}

// Function to get node data from JSON
export const getNodeData = () => {
  return dummyData?.dummyData?.nodeData || null;
};

// Function to get dummy chat messages from JSON
export const getDummyMessages = () => {
  return dummyData?.dummyData?.dummyMessages || [];
};

// Function to get recent searches from JSON
export const getRecentSearches = () => {
  return dummyData?.dummyData?.recentSearches || [];
};

// Function to read root
export async function readRoot() {
  try {
    const response = await Axios.get(`${URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to read root");
  }
}

// Function to post documents
export async function postDocuments(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await Axios.post(`${URL}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to post documents"
    );
  }
}

// Function to query graph with Cypher
export async function queryGraph(
  query,
  systemPrompt,
  chatName,
  debugTest = true
) {
  try {
    const response = await Axios.post(`${URL}/query`, {
      query,
      system_prompt: systemPrompt,
      chat_name: chatName,
      debug_test: debugTest,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to query graph");
  }
}

// Function to get chats
export async function getChats() {
  try {
    const response = await Axios.get(urlChats);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response.data.message || "Failed to fetch bookings data"
    );
  }
}

// Function to get chat history
export async function getChatHistory(chatName) {
  try {
    const response = await Axios.get(`${URL}/chat_history/${chatName}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get chat history"
    );
  }
}

// Function to rename a chat
export async function renameChatApi(chatName, newChatName) {
  try {
    const response = await Axios.put(`${URL}/rename_chat/${chatName}`, {
      new_chat_name: newChatName,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rename chat");
  }
}

// Function to delete a chat
export async function deleteChatApi(chatName) {
  try {
    const response = await Axios.delete(`${URL}/chat/${chatName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete chat");
  }
}

// Function to get suggested questions from JSON
export const getSuggestedQuestions = () => {
  return dummyData?.dummyData?.suggestedQuestions || [];
};
