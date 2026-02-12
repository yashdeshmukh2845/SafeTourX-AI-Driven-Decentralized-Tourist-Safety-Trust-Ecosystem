import logging
import algokit_utils
from algokit_utils import Account, AlgorandClient

logger = logging.getLogger(__name__)

def deploy() -> None:
    # Import the factory from the generated artifacts
    # Note: These artifacts are generated during the build process
    from smart_contracts.artifacts.safe_tour_x.safe_tour_x_client import (
        SafeTourXFactory,
    )

    algorand = AlgorandClient.from_environment()
    deployer = algorand.account.from_environment("DEPLOYER")

    # Initialize the factory
    factory = algorand.client.get_typed_app_factory(
        SafeTourXFactory, default_sender=deployer.address
    )

    # Deploy the application
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # Fund the app account if it was just created/replaced (for box storage MBR)
    # The app needs MBR (Minimum Balance Requirement) for Box storage.
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1), # Fund 1 Algo for MBR
                sender=deployer.address,
                receiver=app_client.app_address,
            )
        )
        logger.info(
            f"Deployed SafeTourX app {app_client.app_id} to address {app_client.app_address}"
        )
