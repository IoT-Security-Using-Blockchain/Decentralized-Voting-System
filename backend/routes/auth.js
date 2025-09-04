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


// backend/routes/auth.js
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || 'refreshsupersecret';

// Store refresh tokens in memory (replace with DB in prod)
const refreshTokensStore = new Map();

// Keep the existing function name
export function generateToken(userID, role = 'voter') {
  return jwt.sign({ userID, role }, SECRET_KEY, { expiresIn: '15m' }); // short-lived access token
}

// Generate refresh token (longer-lived)
export function generateRefreshToken(userID, role = 'voter') {
  const token = jwt.sign({ userID, role }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
  refreshTokensStore.set(token, userID); // store token
  return token;
}

// Verify JWT middleware
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { userID, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Refresh token endpoint handler
export function refreshTokenHandler(req, res) {
  const { token } = req.body;
  if (!token || !refreshTokensStore.has(token)) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET_KEY);
    const accessToken = generateToken(decoded.userID, decoded.role); // use original function
    return res.json({ accessToken });
  } catch (err) {
    refreshTokensStore.delete(token); // remove expired token
    return res.status(401).json({ success: false, error: 'Refresh token expired' });
  }
}
