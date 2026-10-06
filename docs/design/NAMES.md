# Name candidates (researched 2026-10-06)

Criteria: drawn from Atlantis / Plato / Isu lore, pronounceable, short, not crowded on GitHub, no well-known app with the same name. Crowding = number of GitHub repos with the word in the name.

| Name | Origin | GitHub repos | Existing app? | Notes |
|---|---|---|---|---|
| **Critias** | Plato's dialogue that tells the Atlantis story; also the character who narrates it | 15 | none | Recommended. The Atlantis text itself. A human name gives the app a persona ("Critias asks: what is on your mind?"). Minor: the historical Critias was one of the Thirty Tyrants. |
| **Orichalcum** | The Atlantean metal, "second only to gold" in Plato; mined in-game | 46 | none (a crypto "Orichalcos" exists) | Unique and ties to the gold tokens. Long and hard to spell. Short form "Orichalc" possible. |
| **Timaeus** | Plato's companion dialogue, where Atlantis is first mentioned | 45 | none | Smooth sound. A "Timaeus Research" GitHub org exists (ML interpretability), different domain. |
| **Aletheia** | The Isu who guides you through the Fate of Atlantis; Greek for truth / unconcealment | 1371 | Alethea AI (avatar company), many others | Best thematic fit, but crowded. |
| **Ennoia** | Greek ἔννοια: a thought, a notion | 31 | "Eunoia" (different word, similar sound) | Literally "a thought". Greek but not Atlantis-specific. |

Rejected: Mnemosyne (established flashcard app + note app), Pythia (EleutherAI model), Nous / Noesis (crowded), Isu / Animus (Ubisoft lore terms, avoid), Atlantis Inbox (generic, two words).

Decision: pending (see later round).

---

# Round 2 · after the vision changed (2026-10-06)

**Revised vision:** not a notebook. A command deck. Capture a task anywhere, then dispatch it to a remote executor (GitHub Actions, a server, even the laptop at home) that starts working on it. The owner is the commander; the app is the herald; the machines are the fleet. Atlantis in Plato was a naval empire ruled by command.

The name must carry the verb *dispatch*, not the noun *note*.

| Name | Meaning | GitHub repos | npm | Existing app? | Notes |
|---|---|---|---|---|---|
| **Prostagma** | Greek πρόσταγμα, "an order, a command". Famous to gamers as the Greek unit's line in Age of Mythology: *"Prostagma?"* = "Orders?" | 15 | free | none | **Recommended.** The product in one word: a machine standing ready, asking for orders. Memorable, on-theme, uncrowded. Three syllables, pro-STAG-ma. |
| **Keleusma** | The oar-master's shouted beat that commands a trireme's rowers | 1 | free | none | Most Atlantean (sea empire). Beautiful idea, but nobody can spell it. |
| **Keryx** | Greek κῆρυξ, "herald": the one who carries the king's command | 148 | taken | Ketryx (life-sciences software, $39M raised), Keryx Biopharma | Short and sharp. Adjacency to Ketryx weakens it. |
| **Diaktoros** | Hermes' Homeric epithet: the runner, the messenger who gets things done | 0 | free | none | Completely free. Long and obscure. |
| **Entole** | Greek ἐντολή, "command" | 10 | free | none | Short, soft. Carries a Biblical "commandment" echo. |

Rejected: Daimon (905 repos, three companies), Hermes / Iris / Atlas (everywhere), Kerykeion (a popular astrology library), Hegemon (crowded), Kybernetes (Kubernetes), Archon (already a holon-x repo).

## Naming system (proposed, whichever product name wins)

- **The app**: the herald. Carries the command.
- **A connected executor** (GitHub Actions runner, server, laptop): a **daimon**. Greek δαίμων, the guiding spirit that tells Socrates what to do, and the Unix daemon that does work in the background. Crowded as a product name, perfect as an in-product noun.
- **A task state**: *captured* → *dispatched* → *working* → *done*.
- **Empty state**: *"Prostagma?"* (Orders?)

Decision: pending (see later round).

---

# Round 3 · two syllables, Greek root, sci-fi edge (2026-10-06)

Owner's constraints: max two syllables; ancient Greek, optionally fused with a futuristic touch; anime (Evangelion, Code Geass) and Civilization: Beyond Earth allowed as inspiration.

| Name | Say it | Meaning | GitHub repos | npm | Notes |
|---|---|---|---|---|---|
| **Exarch** | EX-arch | ἔξαρχος. The Byzantine emperor's delegate who executed imperial command in a distant province (the Exarch of Ravenna). You command from anywhere; the exarch executes remotely. | 86, all small, none an app | taken (irrelevant, we publish no package) | **Recommended.** Exact meaning fit. Gamer wink: FFXIV's Crystal Exarch, Warhammer's Exarchs. Pairs with the owner's existing `archon` repo: Archon rules, Exarch executes. |
| **Keleus** | KE-leus | From κελεύω, "I command". Also Keleus, the king of Eleusis who received Demeter. | 14 | free | Elegant, hidden meaning, mysterious. Less obviously "action". |
| **Stolos** | STO-los | στόλος, a fleet sent out, an expedition. Atlantis was a naval empire. | 64, incl. an archived task scheduler (sailthru/stolos) | free | "Dispatch a fleet of machines." Strong metaphor, minor name clash in the same domain. |
| **Kerix** | KE-rix | Sci-fi respelling of κῆρυξ, the herald. | 17 | free | Short and sharp. Still echoes the Ketryx company. |

Rejected this round: Anax (770 repos, Anaxi task-management company), Pharos (1887), Dogma (1578, Evangelion's Terminal Dogma but a loaded word), Magi / Magos (crowded), Talos (11k-star Kubernetes OS), Taxis, Kyros, Hoplon (1k-star project), Stello (agent project), Kyrix (MIT project), Keleon (three syllables), Pempo and Entol (weak).

## Brand architecture (if Exarch wins)

- **Archon** — the owner's brain repo in holon-x already carries this name. The one who rules.
- **Exarch** — this app. The herald and delegate. Carries the command out of the citadel.
- **Daimons** — the connected executors (GitHub Actions, a server, the laptop). Socrates' guiding voice and the Unix background worker in one word.
- **Task states** — captured → dispatched → working → done.
- **Empty state** — "What is on your mind?" in Oracle style; once daimons exist, "Prostagma?" (Orders?) as the dispatch prompt.

Decision: pending (see later round).

**DECISION (2026-10-06): Kerix.** Sci-fi respelling of κῆρυξ, the herald. Repo: leoxeno/kerix.
