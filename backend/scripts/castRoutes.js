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




// backend/scripts/voteCasting.js
import { getWallet, getContract, ensureConnectionProfile } from "./utils.js";

/**
 * Cast a vote in a poll
 * @param {string} voterID - Voter's ID
 * @param {string} pollID - Poll ID
 * @param {string} choice - Selected choice
 */
async function castVote(voterID, pollID, choice) {
  await ensureConnectionProfile();
  const wallet = await getWallet();

  // Ensure voter identity exists in wallet
  const identity = await wallet.get(voterID);
  if (!identity) {
    return { success: false, message: `Voter "${voterID}" not enrolled. Please register first.` };
  }

  try {
    // Connect as voter
    const contract = await getContract(wallet, voterID);

    // Submit transaction
    await contract.submitTransaction("CastVote", pollID, voterID, choice);

    return { success: true, message: `✅ Your vote has been cast successfully!` };
  } catch (err) {
    // Clean up error message for frontend
    let userMessage = "Failed to cast vote. Please try again.";
    if (err.message.match(/already voted/i)) {
      userMessage = "⚠ You have already voted in this poll.";
    } else if (err.message.match(/Poll not found/i)) {
      userMessage = "⚠ Poll not found.";
    } else if (err.message.match(/Poll is closed/i)) {
      userMessage = "⚠ This poll is closed.";
    }
    return { success: false, message: userMessage };
  }
}

export { castVote };
