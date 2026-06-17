# Chorus Loom

Design how a community moves.

Chorus Loom is a fully local product for designing civic rituals and governance
sequences for communities, DAOs, protocols and collectives. It is not a
dashboard and not a proposal tool. It is an instrument for composing how a group
moves when something important happens: onboarding, a proposal flow, a public
review, a treasury release, a grant round, an emergency pause, a recovery, a
conflict, a recognition, a sunset or a migration.

Each ritual becomes a living choreography. You design the roles, the stages, the
pauses, the safeguards, the thresholds and the alternative paths. Chorus Loom
turns that into an animated Civic Score: a living visual structure of how a
community moves, stops, decides, corrects, waits or responds.

Governance is not only voting. It is choreography.

## What problem it solves

Most governance tooling captures the text of decisions: proposals, votes,
results. Very little of it captures the behavior around a decision: where a
community should slow down, who is allowed to block, when an independent witness
must confirm, how a fast emergency move is balanced by a forced cooldown, and how
the group recovers when something fails.

Chorus Loom treats that behavior as a first class artifact. A ritual is composed
as a sequence of gestures performed by roles, wrapped in safeguards and gated by
thresholds. The result is a reproducible, shareable description of collective
motion that can be examined for tension before it is ever enacted.

## What designing a civic ritual means

A ritual in Chorus Loom is built from four ingredients:

- Roles: the voices in the chorus. Each role has capacities such as weight,
  visibility, intervention, block, wait and observation. Examples include
  Proposer, Reviewer, Guardian, Treasurer, Witness, Challenger and Community.
- Gestures: the moves the community makes, placed in sequence and stitched
  together with threads. Examples include Invite, Announce, Pause, Reflect,
  Review, Challenge, Consent, Execute, Publish, Reward, Close and Recover.
- Safeguards: protective conditions woven around the choreography, such as a
  minimum review window, a witness requirement, a cooldown after an emergency or
  a defined recovery path.
- Thresholds: the conditions a ritual must satisfy to proceed, such as a quorum
  floor or a number of reviewers.

You move through eight chambers, each a distinct space rather than a page:

1. Threshold: a ceremonial entry into the studio.
2. Seed Table: name the ritual, choose its type, intention and tone.
3. Role Chorus: call the voices into a choral ring.
4. Loom Stage: weave gestures into a spatial and temporal sequence.
5. Knot Field: see the tensions surface as living torsions and respond to them.
6. Playback Hall: watch the choreography animate step by step.
7. Reliquary: a chamber of sealed rituals kept as living relics.
8. Settings: theme, motion, density, GenLayer mock mode and local data tools.

## How the local logic works

Everything runs in the browser. There is no backend, no API and no network call.
The core logic lives in `src/utils`:

- `generateRitualArtifact.js` turns a ritual composition into a Civic Score. It
  computes four deterministic measures from 0 to 100: clarity, friction, balance
  and resilience. It attaches the field of knots, a set of normalized motion
  seeds that drive the visuals, a short expressive civic score sentence and a
  mock proof hash.
- `detectRitualKnots.js` is the knot engine described below.
- `motionSeeds.js` derives the motion parameters (thread density, orbit tempo,
  knot intensity, ribbon spread) from a ritual and its knots.
- `formatters.js` provides shared presentation helpers, including the complexity
  measure and qualitative bands.
- `exportImport.js` handles local JSON download and upload.
- `storage.js` persists rituals and settings to localStorage.

All scores are deterministic: the same composition always produces the same
artifact, which is what allows the visuals and the conceptual contract to agree.

## How the knot engine works

A knot is a tension in the weave, not a validation error. The knot engine reads
the roles, steps, safeguards and thresholds and surfaces tensions such as:

- Speed without rest: several stages with no pause, reflection or delay.
- Concentrated voice: a single role carrying a majority of the ritual weight.
- No room for dissent: no challenge gesture, challenge window or threshold that
  names dissent.
- Witness concentration: a witness requirement that rests on a single witness.
- Unwitnessed action: an execution or treasury movement with no witness at all.
- Overgrown weave: an unusually large number of stages or voices.
- Layered for little: several parallel layers used for a short sequence.
- Execution too fast: an action that runs before any review, pause or decision.
- Endless review: review that repeats with no decision to close it.
- No way back: the ability to act under pressure with no recovery path.
- Bare weave: a long ritual with no safeguards at all.

Each knot carries a severity (Low, Medium or High), a reason and a suggestion. In
the Knot Field they are rendered as coiled, vibrating torsions whose energy
reflects severity. You can respond to a knot by softening, splitting, accepting,
documenting or redirecting it.

The mandatory demo, the Treasury Release Ceremony, is tuned to yield high
clarity, medium friction, good resilience and exactly one Medium knot named
Witness concentration, because its witness requirement rests on a single witness.

## How the GenLayer mock mode works

Chorus Loom ships with a conceptual GenLayer integration that is fully simulated
and local. Nothing touches the network.

- `src/genlayer/mockGenLayer.js` simulates an Intelligent Contract: it adds a
  small artificial latency, returns deterministic fake transaction hashes, and
  reports a simulated validator consensus over the ritual balance and knots.
- `src/genlayer/genlayerClient.js` is the client surface used by the interface.
  It exposes `createRitualRecord`, `analyzeRitualBalance`, `registerCivicScore`,
  `getMockProof` and `getGenLayerStatus`, and honors a mock mode flag that can be
  turned on or off in Settings.
- `genlayer/chorus_loom_contract.py` is a documented conceptual Intelligent
  Contract. It models methods to create a ritual record, analyze roles, detect
  knots, calculate balance, generate a civic score, register an artifact and read
  a ritual. The docstrings explain how validator consensus would agree on
  categorical readings such as the kind and severity of a knot, and on numeric
  scores within a tolerance band. The frontend never calls it; it documents how
  the same logic would live on chain.

When mock mode is off, the client returns a clearly labelled offline response,
because Chorus Loom never performs network calls.

## Install and run locally

Requirements: Node 18 or newer.

```
npm install
npm run dev
```

Open the printed local URL. To produce a production build:

```
npm run build
```

The build output is written to `dist`, including `dist/index.html`. To preview
the production build:

```
npm run preview
```

To scan the source for emoji and em dash characters:

```
npm run no-emoji
```

## Using the demo rituals

On first run, Chorus Loom seeds the Reliquary with several demo rituals:

- Treasury Release Ceremony
- Proposal Reflection Cycle
- Emergency Pause with Cooldown
- Grant Round Weave
- Contributor Recognition Rite

Open any relic to read its full Civic Score, including the animated weave, the
four measures, the active knots and the mock proof. Use Refine in the loom to
load a relic into the composer and reshape it. Use Echo to duplicate it.

## Export and import JSON

From a relic, use Export JSON to download a single ritual. In Settings, use
Export all rituals to download the whole collection, and Import JSON to load
rituals from a file. Imported rituals are merged by id, so re-importing an
exported file keeps the collection consistent. Everything persists to
localStorage, so a reload preserves your work. Settings also includes a Clear
local storage action.

## Project structure

```
chorus-loom/
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  public/_redirects
  scripts/no-emoji.cjs
  genlayer/chorus_loom_contract.py
  src/
    main.jsx
    App.jsx
    styles.css
    store/AppStore.jsx
    data/            constants, role, gesture and safeguard libraries, demo rituals
    utils/           artifact generator, knot engine, motion seeds, formatters, export, storage
    genlayer/        mock client and simulated contract
    components/
      threshold/ seed/ chorus/ loom/ knots/ playback/ reliquary/ shared/ animations/
    spaces/          Threshold, SeedTable, RoleChorus, LoomStage, KnotField, PlaybackHall, Reliquary, Settings
```

## Next steps

- Allow per ritual overrides of role capacities so a Treasurer can be tuned for
  one ceremony without changing the library default.
- Add branching paths and conditional transitions on the Loom Stage so a ritual
  can fork on a challenge or a failed threshold.
- Offer ritual templates beyond the demos, grouped by community archetype.
- Add an accessibility pass with full keyboard choreography for the Loom Stage.
- Connect the conceptual contract to a real GenLayer network behind an explicit,
  user initiated action, keeping the default fully local.
