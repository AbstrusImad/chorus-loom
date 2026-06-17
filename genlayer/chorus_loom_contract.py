# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

# Chorus Loom: conceptual GenLayer Intelligent Contract.
#
# This contract is a conceptual companion to the Chorus Loom frontend. The
# frontend is fully local and never calls this contract; the file documents how
# the same civic ritual logic would live on GenLayer, where validators reach
# consensus on both categorical readings (the kind and severity of knots) and
# numeric readings (clarity, friction, balance and resilience scores) within a
# defined tolerance.
#
# Why GenLayer fits this problem:
#   A civic ritual encodes how a community moves: who acts, who waits, who can
#   block, where it pauses, where it decides. Judging whether a ritual is well
#   balanced is partly numeric and partly a matter of interpretation. GenLayer
#   validators can each evaluate the ritual, then agree through the consensus
#   layer. Numeric scores are accepted when validators land within a tolerance
#   band; categorical labels (for example the name and severity of a knot) are
#   accepted by majority agreement. This makes a subjective civic judgement
#   reproducible and tamper resistant.


class ChorusLoom(gl.Contract):
    # Persistent storage of recorded rituals and their civic scores. Keys are
    # ritual identifiers. Values are TreeMaps describing the ritual and its
    # most recent evaluation.
    rituals: TreeMap[str, TreeMap[str, str]]
    civic_scores: TreeMap[str, str]
    artifacts: TreeMap[str, str]

    def __init__(self) -> None:
        # Storage maps are initialized empty by the runtime.
        pass

    # ---------------------------------------------------------------------
    # Write methods
    # ---------------------------------------------------------------------

    @gl.public.write
    def create_ritual_record(self, ritual_id: str, name: str, ritual_type: str, tone: str) -> None:
        """Record the identity of a ritual.

        Stores the immutable identity fields of a ritual. The choreography
        details (roles, steps, safeguards) are analyzed by the read methods and
        the resulting scores are written through register_artifact, so that the
        heavy interpretation happens once and is then agreed by validators.
        """
        entry: TreeMap[str, str] = TreeMap()
        entry["name"] = name
        entry["type"] = ritual_type
        entry["tone"] = tone
        self.rituals[ritual_id] = entry

    @gl.public.write
    def register_artifact(self, ritual_id: str, civic_score: str, scores_json: str) -> None:
        """Persist the agreed civic score and numeric scores for a ritual.

        scores_json is a compact JSON string holding clarity, friction, balance
        and resilience. In a full deployment the values written here are the
        consensus outputs of analyze_roles, detect_knots and calculate_balance,
        accepted only after validators agreed within tolerance.
        """
        self.civic_scores[ritual_id] = civic_score
        self.artifacts[ritual_id] = scores_json

    # ---------------------------------------------------------------------
    # Read and evaluation methods
    # ---------------------------------------------------------------------

    @gl.public.view
    def get_ritual(self, ritual_id: str) -> str:
        """Return a recorded ritual identity as a readable string.

        Returns an empty marker when the ritual is unknown so callers can
        branch without raising.
        """
        if ritual_id not in self.rituals:
            return "unknown"
        entry = self.rituals[ritual_id]
        return entry["name"] + " | " + entry["type"] + " | " + entry["tone"]

    @gl.public.view
    def analyze_roles(self, weights_csv: str) -> str:
        """Analyze the distribution of power across roles.

        weights_csv is a comma separated list of role weights. The method
        reports whether a single voice holds a majority of the weight. Across a
        validator panel this categorical reading (balanced or concentrated) is
        accepted by majority agreement, while the computed share is accepted
        within a numeric tolerance.
        """
        parts = [p for p in weights_csv.split(",") if p.strip() != ""]
        if len(parts) == 0:
            return "empty"
        total = 0.0
        top = 0.0
        for p in parts:
            value = float(p)
            total = total + value
            if value > top:
                top = value
        if total <= 0.0:
            return "empty"
        share = top / total
        if share > 0.5:
            return "concentrated"
        return "balanced"

    @gl.public.view
    def detect_knots(self, has_pause: bool, has_challenge: bool, has_witness: bool, step_count: int) -> str:
        """Detect tensions in the weave as a categorical list.

        Returns a compact label set such as "speed,dissent". A validator panel
        agrees on the presence of each label by majority. The frontend mirrors
        this logic locally in detectRitualKnots.js with richer descriptions.
        """
        labels: list[str] = []
        if step_count >= 4 and not has_pause:
            labels.append("speed")
        if step_count >= 4 and not has_challenge:
            labels.append("dissent")
        if not has_witness:
            labels.append("witness")
        if len(labels) == 0:
            return "clear"
        return ",".join(labels)

    @gl.public.view
    def calculate_balance(self, weights_csv: str, safeguard_count: int) -> int:
        """Compute a numeric balance score from 0 to 100.

        The score rewards an even spread of weight and the presence of
        safeguards. Validators accept the numeric result when their independent
        computations fall within a small tolerance band, which keeps a partly
        subjective measure reproducible.
        """
        parts = [p for p in weights_csv.split(",") if p.strip() != ""]
        if len(parts) == 0:
            return 0
        total = 0.0
        top = 0.0
        for p in parts:
            value = float(p)
            total = total + value
            if value > top:
                top = value
        if total <= 0.0:
            return 0
        ideal = 1.0 / float(len(parts))
        share = top / total
        concentration = share - ideal
        if concentration < 0.0:
            concentration = 0.0
        score = 100.0 - concentration * 200.0 + float(min(12, safeguard_count * 4))
        if score < 0.0:
            score = 0.0
        if score > 100.0:
            score = 100.0
        return int(score)

    @gl.public.view
    def generate_civic_score(self, ritual_type: str, tone: str, knot_count: int) -> str:
        """Produce a short expressive sentence describing the ritual motion.

        This is the on chain counterpart of the frontend civic score sentence.
        Validators agree on the produced text by majority, since the inputs are
        deterministic categorical values.
        """
        tail = "and holds no open tension."
        if knot_count == 1:
            tail = "and holds one open tension."
        elif knot_count > 1:
            tail = "and holds " + str(knot_count) + " open tensions."
        return "A weave for " + ritual_type + " in a " + tone + " tone, " + tail
