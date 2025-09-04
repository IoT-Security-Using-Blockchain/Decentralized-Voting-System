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





//backend/routes/votingRoutes.js
import { useState, useEffect } from "react";
import { getResults, getPolls } from "../services/votingApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
  const [polls, setPolls] = useState([]);
  const [pollID, setPollID] = useState("");
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch polls for dropdown
  useEffect(() => {
    async function fetchPolls() {
      try {
        const data = await getPolls();
        setPolls(data);
      } catch (err) {
        console.error("Failed to fetch polls:", err);
        setStatus("Failed to load polls");
      }
    }
    fetchPolls();
  }, []);

  const fetchResults = async () => {
    if (!pollID) return setStatus("Please select a poll first!");
    try {
      setLoading(true);
      const res = await getResults(pollID);
      setResults(res.results);
      setStatus("");
    } catch (err) {
      console.error(err);
      setResults(null);
      setStatus("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const getWinnerIndex = () => {
    if (!results) return -1;
    const votes = Object.values(results);
    return votes.indexOf(Math.max(...votes));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 flex flex-col items-center">
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        📊 Poll Results
      </motion.h1>

      <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 relative">
            <Label className="text-white">Select Poll</Label>
            <div className="relative">
              {polls.length === 0 ? (
                <div className="w-full p-2 rounded bg-white/80 text-black text-center">
                  Loading polls...
                </div>
              ) : (
                <motion.select
                  className="w-full p-2 rounded bg-white/80 text-black border border-white/40 backdrop-blur-sm focus:ring-2 focus:ring-indigo-400 transition-all appearance-none cursor-pointer"
                  value={pollID}
                  onChange={(e) => setPollID(e.target.value)}
                  whileTap={{ scale: 0.97 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">-- Select Poll --</option>
                  {polls.map((poll) => (
                    <option key={poll.ID} value={poll.ID}>
                      {poll.Title}
                    </option>
                  ))}
                </motion.select>
              )}
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black"
                animate={{ rotate: pollID ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <FiChevronDown size={20} />
              </motion.div>
            </div>
          </div>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 disabled:opacity-50"
            onClick={fetchResults}
            disabled={loading || !pollID}
          >
            {loading ? "Fetching..." : "Fetch Results"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {status && (
          <motion.div
            className="mt-3 max-w-md w-full p-4 bg-red-500/70 text-white rounded-lg text-center shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>

      {results && (
        <motion.div
          className="w-full max-w-3xl mt-6 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-lg p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Bar
            data={{
              labels: Object.keys(results),
              datasets: [
                {
                  label: "Votes",
                  data: Object.values(results),
                  backgroundColor: Object.keys(results).map((_, i) =>
                    i === getWinnerIndex() ? "#F59E0B" : "#3B82F6"
                  ),
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 1500, easing: "easeOutQuart" },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                },
                title: {
                  display: true,
                  text: polls.find((p) => p.ID === pollID)?.Title || "Poll Results",
                  color: "white",
                  font: { size: 20, weight: "bold" },
                },
              },
              scales: {
                x: {
                  ticks: { color: "white", font: { weight: "bold" } },
                  grid: { color: "rgba(255,255,255,0.2)" },
                },
                y: {
                  ticks: { color: "white", font: { weight: "bold" } },
                  grid: { color: "rgba(255,255,255,0.2)" },
                },
              },
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
