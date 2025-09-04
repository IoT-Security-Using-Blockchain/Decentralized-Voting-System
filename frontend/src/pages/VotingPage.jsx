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





//frontend/src/pages/VotingPage.jsx
import { useState, useEffect } from "react";
import { castVote, getPolls } from "../services/votingApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function VotingPage() {
  const [voterID, setVoterID] = useState("");
  const [pollID, setPollID] = useState("");
  const [choice, setChoice] = useState("");
  const [messages, setMessages] = useState([]);

  const [polls, setPolls] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  // Fetch polls
  useEffect(() => {
    async function fetchPolls() {
      try {
        setLoadingPolls(true);
        const data = await getPolls();
        setPolls(data);
      } catch (err) {
        addMessage("Failed to load polls", "error");
      } finally {
        setLoadingPolls(false);
      }
    }
    fetchPolls();
  }, []);

  // Update candidates
  useEffect(() => {
    const selectedPoll = polls.find((p) => p.ID === pollID);
    setCandidates(selectedPoll?.Options || []);
    setChoice("");
  }, [pollID, polls]);

  // Add message to queue with auto-remove after 3s
  const addMessage = (text, type = "info") => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 3000);
  };

  const handleVoteClick = async () => {
    try {
      const res = await castVote(voterID, pollID, choice);
      addMessage(res.message, "success");
    } catch (err) {
      addMessage(err.message || "Failed to vote", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 p-6">
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🗳️ Cast Your Vote
      </motion.h1>

      <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="space-y-6 p-6">
          {/* Voter ID */}
          <div className="space-y-2">
            <Label className="text-white">Voter ID</Label>
            <input
              className="w-full p-3 rounded-lg text-black bg-white/90 placeholder:text-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={voterID}
              onChange={(e) => setVoterID(e.target.value)}
              placeholder="Enter your Voter ID"
            />
          </div>

          {/* Poll Dropdown */}
          <div className="space-y-2">
            <Label className="text-white">Select Poll</Label>
            {loadingPolls ? (
              <div className="w-full p-3 rounded-lg bg-white/90 text-black text-center shadow-inner">
                Loading polls...
              </div>
            ) : (
              <select
                className="w-full p-3 rounded-lg bg-white/90 text-black border border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={pollID}
                onChange={(e) => setPollID(e.target.value)}
              >
                <option value="">-- Select Poll --</option>
                {polls.map((poll) => (
                  <option key={poll.ID} value={poll.ID}>
                    {poll.Title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Candidates as Radio Buttons */}
          <div className="space-y-2">
            <Label className="text-white">Select Candidate</Label>
            <div className="space-y-2 p-3 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
              {candidates.length === 0 && <p className="text-white/70">Select a poll to see candidates</p>}
              {candidates.map((c, idx) => (
                <label
                  key={idx}
                  className="flex items-center space-x-3 cursor-pointer text-white hover:bg-white/10 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={c}
                    checked={choice === c}
                    onChange={() => setChoice(c)}
                    className="accent-indigo-500 w-5 h-5"
                  />
                  <span className="text-white font-medium">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 disabled:opacity-50"
            onClick={handleVoteClick}
            disabled={!voterID || !pollID || !choice}
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      {/* Animated messages queue */}
      <div className="fixed bottom-6 flex flex-col space-y-3 z-50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className={`px-4 py-2 rounded-lg shadow-md text-white font-medium ${
                msg.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
