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





// frontend/src/pages/Home.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin } from "../services/votingApi"; // <-- import adminLogin

function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showVoterOptions, setShowVoterOptions] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
  try {
    const res = await adminLogin(adminKey); 
    // Save both tokens
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    navigate("/admin");
  } catch (err) {
    alert(err.message || "❌ Invalid Admin Key");
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white relative overflow-hidden px-6">
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/40 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 text-center max-w-2xl">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          🗳️ Decentralized Voting
        </motion.h1>

        <p className="mt-4 text-lg text-gray-300">
          Secure • Transparent • Powered by{" "}
          <span className="text-yellow-400 font-semibold">Blockchain</span>
        </p>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col gap-6 items-center">
          {/* Admin Section */}
          <div className="w-full max-w-md">
            <Button
              className="w-full bg-yellow-400 text-black font-bold shadow-lg hover:scale-105 transition-all duration-300"
              onClick={() => {
                setShowAdminLogin(!showAdminLogin);
                setShowVoterOptions(false);
              }}
            >
              <Shield className="mr-2 h-5 w-5" /> Admin
            </Button>

            <AnimatePresence>
              {showAdminLogin && (
                <motion.div
                  className="mt-4 bg-gray-800 p-4 rounded-lg shadow-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <Input
                      type={showAdminKey ? "text" : "password"}
                      placeholder="Enter Admin Secret"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="mb-3 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showAdminKey ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <Button
                    className="w-full bg-yellow-500 text-black"
                    onClick={handleAdminLogin}
                  >
                    Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voter Section */}
          <div className="w-full max-w-md">
            <Button
              className="w-full bg-green-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300"
              onClick={() => {
                setShowVoterOptions(!showVoterOptions);
                setShowAdminLogin(false);
              }}
            >
              <Vote className="mr-2 h-5 w-5" /> Voter
            </Button>

            <AnimatePresence>
              {showVoterOptions && (
                <motion.div
                  className="mt-4 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/vote")}
                  >
                    Cast Vote
                  </Button>
                  <Button
                    className="w-full bg-indigo-700 hover:bg-indigo-800"
                    onClick={() => navigate("/results")}
                  >
                    View Results
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-gray-400">
          © {new Date().getFullYear()} Decentralized Voting • Built with
          <span className="text-purple-400"> Hyperledger Fabric</span>
        </p>
      </div>
    </div>
  );
}

export default Home;
