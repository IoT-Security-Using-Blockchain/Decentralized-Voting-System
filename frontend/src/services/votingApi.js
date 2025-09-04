/*Copyright [2025] [AMARTYA ROY, NAFISA HOSSAIN]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/




// frontend/src/services/votingApi.js
import axios from "axios";

// ----------------------
// API Instances
// ----------------------
const API_AUTH = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AUTH, // login
  headers: { "Content-Type": "application/json" },
});

const API_VOTING = axios.create({
  baseURL: import.meta.env.VITE_API_URL_VOTING, // admin & poll actions
  headers: { "Content-Type": "application/json" },
});

// ----------------------
// Helpers
// ----------------------
const handleError = (err) => {
  if (err.response?.data?.error) throw new Error(err.response.data.error);
  throw new Error(err.message || "Unknown error");
};

// ----------------------
// Attach token automatically
// ----------------------
API_VOTING.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------
// Refresh Token Support
// ----------------------
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Backend expects { token }, not { refreshToken }
    const res = await API_AUTH.post("/refresh", { token: refreshToken });
    return res.data; // { accessToken }
  } catch (err) {
    handleError(err);
  }
};

// Retry logic on 401
API_VOTING.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw err;

        const { accessToken } = await refreshAccessToken(refreshToken);
        localStorage.setItem("accessToken", accessToken);

        // Retry with new token
        err.config.headers["Authorization"] = `Bearer ${accessToken}`;
        return API_VOTING.request(err.config);
      } catch (refreshErr) {
        // Clear storage + redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("Session expired. Please login again as Admin.");
        window.location.href = "/";
        throw refreshErr;
      }
    }
    throw err;
  }
);

// ----------------------
// Auth
// ----------------------
export const adminLogin = async (adminKey) => {
  try {
    const res = await API_AUTH.post("/admin/login", { adminKey });
    return res.data; // { accessToken, refreshToken }
  } catch (err) {
    handleError(err);
  }
};

// ----------------------
// Admin
// ----------------------
export const enrollAdmin = async () => {
  try {
    const res = await API_VOTING.post("/admin/enroll");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const registerVoter = async (voterID, voterSecret) => {
  try {
    const res = await API_VOTING.post("/voter/register", { voterID, voterSecret });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const deleteVoter = async (voterID) => {
  try {
    const res = await API_VOTING.delete(`/voter/${voterID}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const createPoll = async (pollID, question, options) => {
  try {
    const res = await API_VOTING.post("/poll/create", { pollID, title: question, options });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const closePoll = async (pollID) => {
  try {
    const res = await API_VOTING.post("/poll/close", { pollID });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getPolls = async () => {
  try {
    const res = await API_VOTING.get("/poll/list");
    return res.data; // [{ pollID, title, options }]
  } catch (err) {
    handleError(err);
  }
};

// ----------------------
// Voting
// ----------------------
export const castVote = async (voterID, pollID, choice) => {
  try {
    const res = await API_VOTING.post("/vote/cast", { voterID, pollID, choice });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getResults = async (pollID) => {
  try {
    const res = await API_VOTING.get(`/poll/results/${pollID}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};
