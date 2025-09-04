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




// frontend/src/pages/AdminPanel.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  enrollAdmin,
  registerVoter,
  deleteVoter,
  createPoll,
  closePoll,
} from "../services/votingApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminPanel() {
  const [expanded, setExpanded] = useState(null);
  const [voterID, setVoterID] = useState("");
  const [voterSecret, setVoterSecret] = useState("");
  const [pollID, setPollID] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [showVoterSecret, setShowVoterSecret] = useState(false);

  const token = localStorage.getItem("accessToken");

  const handle = async (fn, successMsg) => {
    if (!token) {
      alert("❌ Please login again as Admin.");
      return;
    }
    try {
      const result = await fn(token);
      alert(successMsg || result.message || "✅ Action successful");
    } catch (err) {
      alert(err.message || "⚠️ Something went wrong");
    }
  };

  const toggleExpand = (section) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white p-6">
      <motion.h1
        className="text-4xl font-extrabold text-center drop-shadow-lg mb-8"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ⚙️ Admin Panel
      </motion.h1>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Enroll Admin */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/20">
          <CardContent className="p-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand("enroll")}
            >
              <h2 className="text-xl font-semibold">👨‍💼 Enroll Admin</h2>
              {expanded === "enroll" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expanded === "enroll" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="mt-4"
              >
                <Button
                  className="bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
                  onClick={() =>
                    handle(enrollAdmin, "Admin enrolled successfully!")
                  }
                >
                  Enroll
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Manage Voter */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/20">
          <CardContent className="p-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand("voter")}
            >
              <h2 className="text-xl font-semibold">🗳️ Manage Voter</h2>
              {expanded === "voter" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expanded === "voter" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="mt-4 space-y-3"
              >
                {/* Register Voter */}
                <Label>Voter ID</Label>
                <Input
                  className="text-white"
                  placeholder="Enter Voter ID"
                  value={voterID}
                  onChange={(e) => setVoterID(e.target.value)}
                />
                <div className="relative w-full">
                  <input
                    type={showVoterSecret ? "text" : "password"}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your secret"
                    value={voterSecret}                 // <-- bind state
                    onChange={(e) => setVoterSecret(e.target.value)}  // <-- update state
                  />

                  <button
                    type="button"
                    onClick={() => setShowVoterSecret(!showVoterSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white-600"
                  >
                    {showVoterSecret ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <Button
                  className="bg-blue-500 hover:bg-green-600 w-full"
                  onClick={async () => {
                    try {
                      // Ensure admin identity is valid before registering voter
                      await enrollAdmin(); // overwrites admin if needed
                      const result = await registerVoter(voterID, voterSecret);
                      alert(result.message || "Voter registered successfully!");
                    } catch (err) {
                      alert(err.message || "❌ Something went wrong");
                    }
                  }}
                >
                  Register
                </Button>

                {/* Delete Voter (ID only) */}
                <Label className="mt-4">Delete Voter by ID</Label>
                <Input
                  className="text-white"
                  value={voterID}
                  onChange={(e) => setVoterID(e.target.value)}
                  placeholder="Enter Voter ID"
                />
                <Button
                  variant="destructive"
                  className="bg-blue-500 hover:bg-red-600 w-full"
                  onClick={() =>
                    handle((t) => deleteVoter(voterID, t), "Voter deleted!")
                  }
                >
                  Delete
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Manage Poll */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/20">
          <CardContent className="p-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand("poll")}
            >
              <h2 className="text-xl font-semibold">📊 Manage Poll</h2>
              {expanded === "poll" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expanded === "poll" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="mt-4 space-y-3"
              >
                {/* Create Poll */}
                <Label>Poll ID</Label>
                <Input
                  className="text-white"
                  placeholder="Enter Poll ID"
                  value={pollID}
                  onChange={(e) => setPollID(e.target.value)}
                />
                <Label>Poll Name</Label>
                <Input
                  className="text-white"
                  placeholder="Enter Poll Name"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Label>Options (comma separated [NO SPACE REQUIRED!])</Label>
                <Input
                  className="text-white"
                  placeholder="e.g., Option1,Option2,Option3"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                />
                <Button
                  className="bg-blue-500 hover:bg-green-600 w-full"
                  onClick={() =>
                    handle(
                      (t) => createPoll(pollID, question, options.split(","), t),
                      "Poll created!"
                    )
                  }
                >
                  Create Poll
                </Button>

                {/* Close Poll (only needs ID) */}
                <Label className="mt-4">Close Poll by ID</Label>
                <Input
                  className="text-white"
                  value={pollID}
                  onChange={(e) => setPollID(e.target.value)}
                  placeholder="Enter Poll ID"
                />
                <Button
                  variant="secondary"
                  className="bg-blue-500 hover:bg-red-500 w-full"
                  onClick={() =>
                    handle((t) => closePoll(pollID, t), "Poll closed!")
                  }
                >
                  Close Poll
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
