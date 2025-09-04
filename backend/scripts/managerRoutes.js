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


// backend/scripts/votingManager.js
import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import path from 'path';
import { ensureConnectionProfile, getContract, listWalletIdentities } from './utils.js';

const WALLET_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'wallet');
const ADMIN_LABEL = 'admin';
const MSP_ID = 'Org1MSP';
const CA_URL = 'https://localhost:7054';

/**
 * Enroll admin into wallet
 */
async function enrollAdmin() {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
  const ca = new FabricCAServices(CA_URL);

  try {
    // Enroll admin (overwrite if exists)
    const enrollment = await ca.enroll({ enrollmentID: ADMIN_LABEL, enrollmentSecret: 'adminpw' });

    await wallet.put(ADMIN_LABEL, {
      credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
      mspId: MSP_ID,
      type: 'X.509'
    });

    return { success: true, message: 'Admin enrolled successfully (overwritten if existed)' };
  } catch (err) {
    throw new Error(`Admin enrollment failed: ${err.message}`);
  }
}


/**
 * Register and enroll a new voter
 */
async function registerVoter(voterID, voterSecret) {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
  const ca = new FabricCAServices(CA_URL);

  // Get admin identity
  const adminIdentity = await wallet.get(ADMIN_LABEL);
  if (!adminIdentity) throw new Error('Admin identity missing');

  // Proper User object for Fabric CA
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, ADMIN_LABEL); 
  // <-- this must be called with adminIdentity and admin label

  if (!adminUser || typeof adminUser.getName !== 'function') {
    throw new Error('Admin identity not recognized as a User object');
  }

  // Register voter
  try {
    await ca.register(
      {
        enrollmentID: voterID,
        enrollmentSecret: voterSecret,
        role: 'client',
        affiliation: 'org1.department1'
      },
      adminUser
    );
  } catch (err) {
    if (err?.errors?.[0]?.code === 74) {
      throw new Error(`Voter "${voterID}" already exists`);
    } else {
      throw new Error(`Registration failed: ${err.message}`);
    }
  }

  // Enroll voter
  const enrollment = await ca.enroll({ enrollmentID: voterID, enrollmentSecret: voterSecret });
  await wallet.put(voterID, {
    credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
    mspId: MSP_ID,
    type: 'X.509'
  });

  // Add voter to ledger
  const contract = await getContract(wallet, voterID);
  await contract.submitTransaction('CreateVoter', voterID, 'Anonymous', '0', 'Default', 'hashedpw');

  return { success: true, message: `Voter "${voterID}" registered & enrolled successfully` };
}

/**
 * Delete voter (remove from wallet + mark inactive in ledger)
 */
async function deleteVoter(voterID) {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);

  try {
    await wallet.remove(voterID);
  } catch (err) {
    console.warn(`⚠ Could not remove voter from wallet: ${err.message}`);
  }

  try {
    const contract = await getContract(wallet, ADMIN_LABEL);
    await contract.submitTransaction('DeleteVoter', voterID);
    return { success: true, message: `Voter "${voterID}" deleted` };
  } catch (err) {
    throw new Error(`Failed to delete voter from ledger: ${err.message}`);
  }
}

/**
 * List all identities in wallet
 */
async function listWallet() {
  await ensureConnectionProfile();
  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
  const ids = await listWalletIdentities(wallet);
  return ids;
}

export {
  enrollAdmin,
  registerVoter,
  deleteVoter,
  listWallet
};

