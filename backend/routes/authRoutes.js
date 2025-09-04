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




// backend/routes/authRoutes.js
import express from 'express';
import dotenv from 'dotenv';
import { generateToken, generateRefreshToken, refreshTokenHandler } from './auth.js'; // ✅ updated path

dotenv.config();

const router = express.Router();

// ---- Admin login ----
router.post('/admin/login', (req, res) => {
  const { adminKey } = req.body;

  if (!adminKey) {
    return res.status(400).json({ success: false, error: 'Admin key is required' });
  }

  if (adminKey !== process.env.CA_ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Invalid Admin Key' });
  }

  // Generate short-lived access token + refresh token
  const accessToken = generateToken(process.env.CA_ADMIN_ID, 'admin');
  const refreshToken = generateRefreshToken(process.env.CA_ADMIN_ID, 'admin');

  res.json({ success: true, accessToken, refreshToken });
});

// ---- Voter login (optional for later) ----
router.post('/login', (req, res) => {
  // TODO: voter login logic
  res.json({ success: true, msg: "Voter login not implemented yet" });
});

// ---- Refresh token ----
router.post('/refresh', refreshTokenHandler);

export default router;
