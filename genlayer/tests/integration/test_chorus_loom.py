import json
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded

POSTURES = ("Measured", "Balanced", "Resilient", "Fragile", "Rigid", "Volatile")

# Target the deployable contract by path. The sibling chorus_loom_contract.py is
# conceptual documentation that also declares a ChorusLoom class, so loading by
# bare name would be ambiguous.
CONTRACT_PATH = Path(__file__).resolve().parents[2] / "contract.py"


def test_treasury_release_ceremony_consensus():
    factory = get_contract_factory(contract_file_path=CONTRACT_PATH)
    contract = factory.deploy(args=[])

    composition = json.dumps({
        "roles": ["Treasurer", "Reviewer", "Witness", "Community"],
        "steps": [
            "Announce",
            "Public Review",
            "Pause",
            "Witness Confirmation",
            "Execute",
            "Publish Receipt",
        ],
        "safeguards": [
            "Minimum review window",
            "Witness requirement",
            "Publication after execution",
        ],
        "thresholds": ["2 reviewers minimum", "No unresolved challenge"],
    })

    # The AI consensus write. Validators must agree on the posture exactly and
    # on the four scores within tolerance.
    receipt = contract.analyze(
        args=[
            "Treasury Release Ceremony",
            "Treasury Release",
            "Deliberate",
            composition,
        ]
    ).transact()
    assert tx_execution_succeeded(receipt)

    stats = contract.get_stats(args=[]).call()
    assert int(stats["analyses"]) == 1
    assert int(stats["artifacts"]) == 1

    listing = contract.get_artifacts(args=[0]).call()
    assert len(listing) == 1
    artifact = listing[0]

    posture = artifact["posture"]
    clarity = int(artifact["clarityScore"])
    friction = int(artifact["frictionScore"])
    balance = int(artifact["balanceScore"])
    resilience = int(artifact["resilienceScore"])

    assert posture in POSTURES
    assert 0 <= clarity <= 100
    assert 0 <= friction <= 100
    assert 0 <= balance <= 100
    assert 0 <= resilience <= 100

    # A well-formed ceremony with legible roles and clean stages should read
    # clearly. Asserted as a reasonable floor, not hard-pinned.
    assert clarity >= 55

    print(
        "OBSERVED posture={0} clarity={1} friction={2} balance={3} resilience={4}".format(
            posture, clarity, friction, balance, resilience
        )
    )

    # The stored artifact is retrievable by id and carries the agreed posture.
    fetched = contract.get_artifact(args=[artifact["id"]]).call()
    assert fetched["posture"] == posture
