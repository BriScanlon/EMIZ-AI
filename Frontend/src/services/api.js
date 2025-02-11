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

// Function to get node data from JSON
export const getNodeData = () => {
  return dummyData?.dummyData?.nodeData || null;
};
