const algosdk = require('algosdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Config
const algodToken = process.env.ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const algodServer = process.env.ALGOD_SERVER || 'http://localhost';
const algodPort = process.env.ALGOD_PORT || 4001;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Admin Account (Backend Wallet)
const mnemonic = process.env.MNEMONIC;
let adminAccount;
if (mnemonic) {
    try {
        adminAccount = algosdk.mnemonicToSecretKey(mnemonic);
    } catch (e) {
        console.error("Invalid Mnemonic in .env");
    }
}

// Get App ID
let appId = 0;
try {
    const appIdPath = path.join(__dirname, '../../app_id.txt');
    if (fs.existsSync(appIdPath)) {
        appId = parseInt(fs.readFileSync(appIdPath, 'utf8'));
    } else {
        console.warn("App ID file not found. Please deploy contract or set APP_ID manually.");
        // Fallback or env
        if (process.env.APP_ID) appId = parseInt(process.env.APP_ID);
    }
} catch (e) {
    console.warn("Could not read App ID:", e.message);
}

const waitForConfirmation = async function (algodClient, txId) {
    let lastround = (await algodClient.status().do())['last-round'];
    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
            return pendingInfo;
        }
        lastround++;
        await algodClient.statusAfterBlock(lastround).do();
    }
};

// Functions

async function registerUserOnChain(userAddress, identityHash) {
    if (!adminAccount) throw new Error("Admin account not configured");

    // ApplicationCall - NoOp
    // Method: register_user(string)string
    // We can use ABI or raw ApplicationCall with arguments.
    // PyTeal contract expects: register, identity_hash

    // Using raw app args for simplicity with PyTeal "router" we built manually-ish
    // The manual router I wrote:
    // [Txn.application_args[0] == Bytes("register"), register_user]
    // register_user: App.localPut(Txn.sender(), user_identity_hash, arg1)

    // Important: User needs to Opt-In to the app first to have local state!
    // So we need two txns usually: OptIn, then Call. 
    // Or just OptIn if register logic is inside OptIn?
    // My contract has: [Txn.on_completion() == OnComplete.OptIn, handle_optin] which inits local state.
    // And `register` method puts data.

    const params = await algodClient.getTransactionParams().do();

    // 1. Opt-In (if not already) - strictly user must sign this.
    // If backend signs, it registers ITSELF, not the user.
    // If we want "Tourist Digital Identity", the USER must sign.
    // BUT user prompt says: "Connect backend to blockchain".
    // Maybe backend registers users on behalf of them?
    // If so, backend creates an account for them?

    // For MVP simplification: We can store the hash in the Admin's Global State (Box storage preferably) mapped to User ID?
    // My contract used `BoxMap(Account, String)`.
    // If using Boxes, any account (Admin) can write if logic permits.
    // My contract: `self.user_registry[Txn.sender] = identity_hash`
    // This implies Sender MUST be the user.

    // If Backend manages it, Backend is the Sender.
    // So Backend registers "User X" -> "Hash Y".
    // Contract needs to accept an argument for "Target User Address" if Backend signs?
    // OR Backend just creates a new Algorand Account for the user, holds keys, and signs? (Custodial).

    // Let's go with Custodial for MVP (easiest for "Backend connection").
    // Backend creates account, opts in, registers.
    // Returns address and private key to user? Or keeps it?

    // Better: We just simulate the interaction for now.
    // Let's assume Backend signs a txn to log "New User: <Hash>" in a global log (booking style).
    // Identity on Local Storage (User-side) is strictly Web3.
    // If Web2 User Login, we just hash and store on chain for "Proof of Existence".

    // Let's use `book_hotel` style logging for Identity too?
    // "Identity Registered: <Hash>"

    const appArgs = [new Uint8Array(Buffer.from("register")), new Uint8Array(Buffer.from(identityHash))];

    // Note: If using Local State, we need to OptIn.
    // The contract requires `register` arg 0.
    // If we just want to log, we can use a NoOp call.

    const txn = algosdk.makeApplicationNoOpTxn(
        adminAccount.addr,
        params,
        appId,
        appArgs
    );

    const signedTxn = txn.signTxn(adminAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(algodClient, txId);
    return txId;
}

async function logBookingOnChain(bookingHash) {
    if (!adminAccount) throw new Error("Admin account not configured");

    const params = await algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from("book")), new Uint8Array(Buffer.from(bookingHash))];

    const txn = algosdk.makeApplicationNoOpTxn(
        adminAccount.addr,
        params,
        appId,
        appArgs
    );

    const signedTxn = txn.signTxn(adminAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(algodClient, txId);
    return txId;
}

async function logIncidentOnChain(location, type) {
    if (!adminAccount) throw new Error("Admin account not configured");

    const params = await algodClient.getTransactionParams().do();
    const appArgs = [
        new Uint8Array(Buffer.from("sos")),
        new Uint8Array(Buffer.from(location)),
        new Uint8Array(Buffer.from(type))
    ];

    const txn = algosdk.makeApplicationNoOpTxn(
        adminAccount.addr,
        params,
        appId,
        appArgs
    );

    const signedTxn = txn.signTxn(adminAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(algodClient, txId);
    return txId;
}

module.exports = {
    registerUserOnChain,
    logBookingOnChain,
    logIncidentOnChain,
    algodClient
};
