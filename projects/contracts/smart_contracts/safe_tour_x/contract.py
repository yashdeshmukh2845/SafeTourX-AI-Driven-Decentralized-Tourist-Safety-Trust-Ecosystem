from pyteal import *

def approval_program():
    # Application State Keys
    user_identity_hash = Bytes("IdentityHash") # Local State: User's identity hash
    booking_count = Bytes("BookingCount")      # Global State: Total bookings
    
    # helper to check if sender is creator
    is_creator = Txn.sender() == Global.creator_address()

    # Handle Creation
    handle_creation = Seq(
        App.globalPut(booking_count, Int(0)),
        Return(Int(1))
    )

    # OptIn: Initialize local state
    handle_optin = Seq(
        App.localPut(Txn.sender(), user_identity_hash, Bytes("")),
        Return(Int(1))
    )

    # CloseOut: Usually allows closing out
    handle_closeout = Return(Int(1))
    
    # Update/Delete: Only creator
    handle_update = Return(is_creator)
    handle_delete = Return(is_creator)

    # Method: Register User
    # Args: [identity_hash]
    # Stores hash in sender's local state
    identity_arg = Txn.application_args[1]
    register_user = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        App.localPut(Txn.sender(), user_identity_hash, identity_arg),
        Return(Int(1))
    )

    # Method: Book Hotel
    # Args: [booking_hash]
    # Logs booking hash. Increments global counter.
    booking_arg = Txn.application_args[1]
    book_hotel = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(booking_count, App.globalGet(booking_count) + Int(1)),
        Log(Concat(Bytes("Booking:"), booking_arg)),
        Return(Int(1))
    )

    # Method: Trigger SOS
    # Args: [location, incident_type]
    # Logs SOS details.
    location_arg = Txn.application_args[1]
    incident_arg = Txn.application_args[2]
    trigger_sos = Seq(
        Assert(Txn.application_args.length() == Int(3)),
        Log(Concat(Bytes("SOS:"), location_arg, Bytes("|"), incident_arg)),
        Return(Int(1))
    )

    # Router
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("register"), register_user],
        [Txn.application_args[0] == Bytes("book"), book_hotel],
        [Txn.application_args[0] == Bytes("sos"), trigger_sos],
    )

    program = Cond(
        [Txn.application_args.length() == Int(0), Return(Int(1))], # Bare NoOp? NO, checks on creation
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_delete],
    )

    return If(Txn.application_id() == Int(0), handle_creation, program)

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("safe_tour_x.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)

    with open("safe_tour_x_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)
