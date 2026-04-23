---
name: analyze-experiment
description: Use when a product / business experiment ends, the user asks "how did test X do," or asks to analyze an A/B test — read the hypothesis and variant data, compute lift, statistical significance, confidence interval, minimum detectable effect, and check guardrail metrics; write a structured readout with an explicit recommendation (ship / kill / iterate / inconclusive-extend). Never recommends SHIP without significance. NOT for paid-ad funnel tests (growth-paid agent owns those).
---

# Analyze Experiment

Scope: product and business experiments — onboarding variants,
checkout flow, pricing page, retention hooks. NOT paid-ad creative
tests (growth-paid in the marketing workspace owns those — same
math, different context and reporting).

## When to use

- User says "experiment {X} ended" / "analyze the {checkout} test" /
  "how did the {variant} do" / "ship or kill the pricing test?"
- An `experiments.json` row flips to `status: "ended"` and no
  `experiments/{slug}/readout.md` exists.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Priorities inform
   how I weight the recommendation ("ship anyway — adjacent to a
   priority" vs "kill, not load-bearing").

2. **Read framework.** Read `config/experiments-framework.md`. If
   missing, ask ONE question: *"Quick — default significance
   threshold (95% / 99%), minimum detectable effect, and any
   guardrail metrics every experiment should check? Paste, drop a
   stats doc, or tell me 'sensible defaults' — 95% / 5% MDE / the
   primary metric's guardrails I'll propose."* Write and continue.
   Thresholds live in config — not hardcoded.

3. **Load experiment metadata.** Read `experiments.json` and find
   the entry. If missing, create one from the user's description
   (`slug`, `hypothesis`, `variants`, `primaryMetric`,
   `guardrailMetrics`, `startDate`, `endDate`, `status: "ended"`).

4. **Pull variant-level data.** Preferred — run a read-only SQL
   query via the connected warehouse (slug discovered via
   `composio search warehouse`) that returns per-variant counts and
   metric values. Fallback — user provides CSV or paste. Either way
   capture `n_variant`, observed primary-metric value per variant,
   per-variant guardrail values.

5. **Compute lift.** For each non-control variant:
   `lift = (variantValue - controlValue) / controlValue`. Record
   absolute delta and percent lift.

6. **Compute significance.** Pick the right test:
   - Binomial / conversion rate → two-proportion z-test (chi-squared
     for more than 2 variants).
   - Continuous (revenue, minutes) → Welch's t (two variants) or
     ANOVA.
   Report `p` and the framework-configured CI (default 95%).

7. **Compute minimum detectable effect.** Given observed sample
   size and control variance, what's the smallest lift detectable
   at 80% power? Report in lift units. If MDE > observed lift, the
   experiment is under-powered — flag it.

8. **Check guardrail metrics.** Same lift/p/CI per guardrail. A
   significant move in the wrong direction blocks a SHIP
   recommendation even if the primary won.

9. **Decide recommendation.**
   - **SHIP** — primary lift positive, `p < threshold`, no guardrail
     breach.
   - **KILL** — primary lift negative and significant, OR primary
     positive but guardrail breached.
   - **ITERATE** — lift positive but `p > threshold` AND MDE
     suggests under-powered → redesign with larger sample.
   - **INCONCLUSIVE — EXTEND** — directionally positive, not
     significant, MDE says more time helps.

10. **Write the readout** to `experiments/{slug}/readout.md`
    (atomic):

    ```markdown
    # Experiment: {slug}
    {one-line hypothesis}

    ## Design
    Variants: control, {variant-a}, ...
    Primary metric: {metric}
    Guardrails: {list}
    Duration: {start} → {end} ({N days})
    Sample size: n_control = {N}, n_variant = {N}

    ## Primary metric result
    | Variant | n | Observed | Lift | 95% CI | p |
    |---|---|---|---|---|---|
    | control | ... | ... | — | — | — |
    | variant-a | ... | ... | +X% | [lo, hi] | 0.0XX |

    ## Guardrails
    (same table shape — only rows with notable movement)

    ## Minimum detectable effect
    At 80% power with observed variance, this experiment could
    detect lifts of ≥ {MDE}. Observed lift: {lift}.

    ## Recommendation
    **{SHIP | KILL | ITERATE | INCONCLUSIVE-EXTEND}**
    {2–3 sentence rationale — lift + significance + guardrails +
    MDE.}

    ## Caveats
    - {data-quality flags}
    - {exposure-imbalance flags}
    - {metric-freshness flags}
    ```

11. **Update `experiments.json`** — flip to `status: "analyzed"`,
    record `sampleSize`.

12. **Save the variant SQL** under
    `queries/experiment-{slug}/query.sql` and `notes.md`. Update
    `queries.json`.

13. **Append to `outputs.json`** with `type: "experiment"`,
    status "ready".

14. **Never say "directionally positive" as a SHIP signal.** If the
    primary lift is positive but not significant, the
    recommendation is ITERATE or INCONCLUSIVE — never SHIP.

## Outputs

- `experiments/{slug}/readout.md` (new or overwritten)
- Updated `experiments.json`
- New or updated `queries/experiment-{slug}/query.sql` + `notes.md`
- Updated `queries.json`
- Possibly updated `config/experiments-framework.md` (progressive
  capture)
- Appends to `outputs.json` with `type: "experiment"`.

## What I never do

- **Recommend SHIP without significance.**
- **Hardcode the significance threshold** — it lives in
  `config/experiments-framework.md`.
- **Stray into paid-ad creative tests** — if the user asks me to
  analyze an ad-variant test, I point at the growth-paid agent in
  the marketing workspace.
- **Invent guardrails** — use what's in the framework or what the
  user names.
