import axios from "axios";

import { NASA_API_KEY } from "../config/api";

const API_KEY = NASA_API_KEY; // https://api.nasa.gov/  - For getting a new API
const BASE_URL = "https://api.nasa.gov/planetary/apod";

export const getAPOD = async (date = "") => {
  try {
    const params = {
      api_key: API_KEY,
      thumbs: true, // Include video thumbnails if it's a video
    };

    if (date) {
      params.date = date;
    }

    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error("Error Fetching APOD: ", error);
    throw error;
  }
};

export const getRandomAPODs = async (count = 10) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        count,
        thumbs: true, // Include video thumbnails if it's a video
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching random APODs: ", error);
    throw error;
  }
};
