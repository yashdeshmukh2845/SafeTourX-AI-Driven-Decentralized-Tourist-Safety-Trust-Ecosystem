import algosdk
from algosdk.v2client import algod, indexer
from algosdk import account, mnemonic
from algosdk.transaction import StateSchema, ApplicationCreateTxn, OnComplete
import base64
import os
import time

def deploy():
    # Load environment variables from backend .env
    from dotenv import load_dotenv
    load_dotenv("../../backend/.env")

    # Config
    algod_address = os.getenv("ALGOD_SERVER")
    algod_token = os.getenv("ALGOD_TOKEN")
    # headers = {"X-Algo-API-Token": algod_token} # Not needed for AlgoNode if token is empty

    if not algod_address:
        print("Error: ALGOD_SERVER not found in .env")
        return

    # Initialize Algod Client
    # AlgoNode endpoint: https://testnet-api.algonode.cloud (443 is implicit with https)
    algod_client = algod.AlgodClient(algod_token, algod_address)

    # Get Account from Mnemonic in .env
    passphrase = os.getenv("MNEMONIC")
    if not passphrase or "REPLACE" in passphrase:
        print("Error: MNEMONIC not set in .env")
        return

    private_key = mnemonic.to_private_key(passphrase)
    sender_address = account.address_from_private_key(private_key)
    print(f"Deploying with account: {sender_address}")

    # Read TEAL files
    try:
        with open("smart_contracts/safe_tour_x/safe_tour_x.teal", "r") as f:
            approval_teal = f.read()
        with open("smart_contracts/safe_tour_x/safe_tour_x_clear.teal", "r") as f:
            clear_teal = f.read()
    except FileNotFoundError:
        print("Error: TEAL files not found. Please compile the contract first.")
        return

    # Compile TEAL
    try:
        approval_result = algod_client.compile(approval_teal)
        approval_program = base64.b64decode(approval_result["result"])
        
        clear_result = algod_client.compile(clear_teal)
        clear_program = base64.b64decode(clear_result["result"])
    except Exception as e:
        print(f"Error compiling TEAL: {e}")
        return

    # Deploy App
    # Global: 1 Uint (BookingCount), 0 Bytes
    # Local: 0 Uint, 1 Byte (IdentityHash)
    global_schema = StateSchema(num_uints=1, num_byte_slices=0)
    local_schema = StateSchema(num_uints=0, num_byte_slices=1)

    txn = ApplicationCreateTxn(
        sender=sender_address,
        sp=algod_client.suggested_params(),
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema
    )

    signed_txn = txn.sign(private_key)
    tx_id = signed_txn.transaction.get_txid()

    
    print(f"Deploying App... TXID: {tx_id}")
    print(f"AlgoExplorer Link: https://testnet.algoexplorer.io/tx/{tx_id}")
    
    algod_client.send_transaction(signed_txn)
    
    # Wait for confirmation
    wait_for_confirmation(algod_client, tx_id)
    
    # Get App ID
    ptx = algod_client.pending_transaction_info(tx_id)
    app_id = ptx["application-index"]
    print(f"Deployed App ID: {app_id}")
    
    # Save App ID to file for backend usage
    with open("../../backend/app_id.txt", "w") as f:
        f.write(str(app_id))

def wait_for_confirmation(client, txid):
    last_round = client.status().get('last-round')
    txinfo = client.pending_transaction_info(txid)
    while not (txinfo.get('confirmed-round') and txinfo.get('confirmed-round') > 0):
        print("Waiting for confirmation...")
        last_round += 1
        client.status_after_block(last_round)
        txinfo = client.pending_transaction_info(txid)
    print("Transaction {} confirmed in round {}.".format(txid, txinfo.get('confirmed-round')))
    return txinfo

if __name__ == "__main__":
    deploy()
