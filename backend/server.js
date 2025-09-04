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




// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import votingRoutes from './routes/votingRoutes.js';
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';

dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Routes
app.use('/api/voting', votingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

