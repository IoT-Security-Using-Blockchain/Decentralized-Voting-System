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





//backend/scripts/utils.js
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url"; // <-- needed for robust paths
import { Wallets, Gateway } from "fabric-network";
import dotenv from 'dotenv';
dotenv.config();

// Convert import.meta.url to proper file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKEND_DIR = path.join(__dirname, ".."); // points to backend/
export const WALLET_DIR = process.env.WALLET_PATH || path.join(BACKEND_DIR, "wallet");

// Fixed connection profile source path
export const CONNECTION_SRC =
  process.env.CONNECTION_SRC ||
  path.join(__dirname, "../../organizations/peerOrganizations/org1.example.com/connection-org1.json");

export const CONNECTION_DEST =
  process.env.FABRIC_CONNECTION_PROFILE || path.join(BACKEND_DIR, "connection-org1.json");

export const CHANNEL_NAME = process.env.CHANNEL_NAME || "mychannel";
export const CC_NAME = process.env.CHAINCODE_NAME || "vote";
export const ADMIN_LABEL = process.env.CA_ADMIN_ID || "admin";

export async function ensureConnectionProfile() {
  try {
    if (await fs.pathExists(CONNECTION_SRC)) {
      await fs.copy(CONNECTION_SRC, CONNECTION_DEST, { overwrite: true });
      console.log(`✅ connection-org1.json copied to ${CONNECTION_DEST}`);
    } else {
      console.warn(`⚠ Source connection profile not found: ${CONNECTION_SRC}`);
    }
  } catch (err) {
    console.error("❌ Failed to copy connection profile:", err);
  }
}

export async function getWallet() {
  await fs.ensureDir(WALLET_DIR);
  return Wallets.newFileSystemWallet(WALLET_DIR);
}

export async function listWalletIdentities(wallet) {
  const items = await fs.readdir(WALLET_DIR);
  const labels = items.map(f => f.replace(/\.id$/, ""));
  console.log("📋 Wallet identities:");
  labels.forEach((label, idx) => console.log(`  ${idx + 1}. ${label}`));
  return labels;
}

export async function getContract(wallet, identity = ADMIN_LABEL) {
  const ccp = JSON.parse(await fs.readFile(CONNECTION_DEST, "utf8"));
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity,
    discovery: { enabled: true, asLocalhost: true },
  });
  const network = await gateway.getNetwork(CHANNEL_NAME);
  const contract = network.getContract(CC_NAME);
  
  // Proper disconnect for production safety
  contract.gatewayDisconnect = async () => gateway.disconnect();
  
  return contract;
}

