import algosdk
from algosdk.v2client import algod, indexer
from algosdk import account, mnemonic
from algosdk.future.transaction import StateSchema, ApplicationCreateTxn
import base64
import os
import time

def deploy():
    # Config
    algod_address = "http://localhost:4001"
    algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    
    # Initialize Algod Client
    algod_client = algod.AlgodClient(algod_token, algod_address)

    # Get Account from LocalNet or Mnemonic
    # Usually LocalNet has default accounts. Let's use `kmd` or hardcoded mnemonic for testing if available.
    # For now, let's try to get from KMD via algokit-utils or just assume standard LocalNet wallet.
    # Simpler: Create a new account and fund it using the dispenser if possible, OR use the default account from `algokit localnet`
    
    # We will assume a funded account mnemonic is provided in env or we use the default KMD wallet
    # To keep it simple for this script, let's use a hardcoded mnemonic from LocalNet (often printed on startup)
    # OR better: use `algokit-utils` to get the default account!
    
    from algokit_utils import get_localnet_default_account
    deployer = get_localnet_default_account(algod_client)
    print(f"Deploying with account: {deployer.address}")

    # Read TEAL files
    with open("smart_contracts/safe_tour_x/safe_tour_x.teal", "r") as f:
        approval_teal = f.read()
    with open("smart_contracts/safe_tour_x/safe_tour_x_clear.teal", "r") as f:
        clear_teal = f.read()

    # Compile TEAL
    approval_result = algod_client.compile(approval_teal)
    approval_program = base64.b64decode(approval_result["result"])
    
    clear_result = algod_client.compile(clear_teal)
    clear_program = base64.b64decode(clear_result["result"])

    # Deploy App
    # Global: 1 Uint (BookingCount), 0 Bytes
    # Local: 0 Uint, 1 Byte (IdentityHash)
    global_schema = StateSchema(num_uints=1, num_byte_slices=0)
    local_schema = StateSchema(num_uints=0, num_byte_slices=1)

    txn = ApplicationCreateTxn(
        sender=deployer.address,
        sp=algod_client.suggested_params(),
        on_complete=algosdk.future.transaction.OnComplete.NoOpOC.real,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema
    )

    signed_txn = txn.sign(deployer.private_key)
    tx_id = signed_txn.transaction_id
    
    print(f"Deploying App... TXID: {tx_id}")
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
