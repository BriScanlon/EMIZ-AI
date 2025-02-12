import Axios from 'axios';
import { BASE_URL } from '../config/config';
import dummyData from '../data/dummyData.json';

const URL = `${BASE_URL}`;

export const urlChats = `${URL}/chats`;
export const urlChat = `${URL}/chat`;

// Function to send a chat message
export async function sendChatMessage({ userId, message }) {
  try {
    const response = await Axios.post(urlChat, {
      userId,
      message,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send message');
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
    throw new Error(error.response?.data?.message || 'Failed to read root');
  }
}

// Function to post documents
export async function postDocuments(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await Axios.post(`${URL}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to post documents');
  }
}

// Function to query graph with Cypher
export async function queryGraph(query, systemPrompt, chatName, debugTest = true) {
  try {
    const response = await Axios.post(`${URL}/query`, {
      query,
      system_prompt: systemPrompt,
      chat_name: chatName,
      debug_test: debugTest,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to query graph');
  }
}

// Function to get chats
export async function getChats() {
  try {
    const response = await Axios.get(`${URL}/chats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get chats');
  }
}

// Function to get chat history
export async function getChatHistory(chatName) {
  try {
    const response = await Axios.get(`${URL}/chat_history/${chatName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get chat history');
  }
}