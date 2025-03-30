import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:3031',
})

export const setAuthToken = (token, logout) => {
  
    //  Add the token to each request header
    if (token) {
      axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.Authorization;
    }


    // if user have an expird session (the api returning 401), we will logout
    axiosInstance.interceptors.response.use(
      (response) => response, // Return successful responses as they are
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Handle the 401 error (e.g., logout the user, refresh token, redirect, etc.)
          alert("Your session has expired. Please log in again.");
          logout();
        }
        return Promise.reject(error);
      }
    );
  };


