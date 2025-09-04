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



// backend/scripts/pollManager.js
import { Wallets } from "fabric-network";
import { ensureConnectionProfile, getContract } from "./utils.js";
import path from "path";

const WALLET_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "wallet");
const ADMIN_LABEL = "admin";

/**
 * Create a new poll
 * @param {string} pollID - Unique poll identifier
 * @param {string} title - Poll title
 * @param {string[]} options - Array of options
 */
async function createPoll(pollID, title, options) {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);

  const contract = await getContract(wallet, ADMIN_LABEL);
  await contract.submitTransaction("CreatePoll", pollID, title, JSON.stringify(options), ADMIN_LABEL);

  return { success: true, message: `Poll "${pollID}" created` };
}

/**
 * Close an active poll
 * @param {string} pollID - Poll identifier
 */
async function closePoll(pollID) {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);

  const contract = await getContract(wallet, ADMIN_LABEL);
  await contract.submitTransaction("ClosePoll", pollID);

  return { success: true, message: `Poll "${pollID}" closed` };
}

/**
 * Get results of a poll
 * @param {string} pollID - Poll identifier
 */
async function getResults(pollID) {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);

  const contract = await getContract(wallet, ADMIN_LABEL);
  const resultBuffer = await contract.evaluateTransaction("GetResults", pollID);

  return {
    success: true,
    pollID,
    results: JSON.parse(resultBuffer.toString())
  };
}

export { createPoll, closePoll, getResults };

