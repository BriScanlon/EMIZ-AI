<<<<<<< HEAD
import Axios from "axios";
import { BASE_URL } from "../config/config";
import dummyData from "../data/dummyData.json";

const URL = `${BASE_URL}`;

const urlChats = `${URL}/chats`;
const urlChat = `${URL}/chat`;

// Function to post a query with specified parameters
export async function postQuery({
  query,
  system_prompt,
  chat_name,
  debug_test = true,
}) {
  try {
    const response = await Axios.post(`${URL}/query`, {
      query,
      system_prompt,
      chat_name,
      debug_test,
    });
    return response.data;
    // console.log(response.data);
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
=======
import dummyData from '../data/dummyData.json';

export const BASE_URL = import.meta.env.VITE_BASE_URL || "https://example.com";

const API_URL = `${BASE_URL}/api/chat`;
export const urlNode = `${BASE_URL}/api/v1/users/node`;

// Function to fetch chat response based on the search request
export const fetchChatSummaryResponse = async (searchRequest) => {
  try {
    const response = await fetch(`${API_URL}?query=${encodeURIComponent(searchRequest)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    throw error;
  }
};
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5

// Function to get node data from JSON
export const getNodeData = () => {
  return dummyData?.dummyData?.nodeData || null;
};
<<<<<<< HEAD

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
// export async function getChats() {
//   try {
//     const response = await Axios.get(`${URL}/chats`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to get chats');
//   }
// }

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

// Function to get suggested questions from JSON
export const getSuggestedQuestions = () => {
  return dummyData?.dummyData?.suggestedQuestions || [];
};
=======
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
