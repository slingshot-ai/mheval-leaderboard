# Mental Health Evaluation Leaderboard

[![CI](https://github.com/slingshot-ai/mheval-leaderboard/actions/workflows/ci.yml/badge.svg)](https://github.com/slingshot-ai/mheval-leaderboard/actions/workflows/ci.yml)
[![Deploy](https://github.com/slingshot-ai/mheval-leaderboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/slingshot-ai/mheval-leaderboard/actions/workflows/deploy.yml)

**🏆 Leaderboard: <https://slingshot-ai.github.io/mheval-leaderboard/>**

Community results for language models on therapy and mental-health benchmarks, produced with the [Mental Health Evaluation Harness](https://github.com/slingshot-ai/mheval) (`mheval`). Anyone can submit results for any model, including private ones, on any subset of benchmarks, and add more benchmarks later. Each submission is a pull request; CI validates it, and the site rebuilds when it is merged.

## Submitting results

You run the benchmarks yourself (with your own API keys), then open a pull request with the result files that `mheval` writes for you.

### 1. Run the benchmarks

Install a released version of `mheval` (see [releases](https://github.com/slingshot-ai/mheval/releases)) and run any subset of tasks on your model:

```bash
git clone --branch v0.1.0 https://github.com/slingshot-ai/mheval.git
cd mheval && uv venv && uv pip install -e .

mheval --tasks mindeval,vera_mh,spiral_bench \
  --model_args model=<model-id>,base_url=<https://…/v1>,api_key_env=<ENV_VAR>
```

- Run every task in full (no `--limit`) with its default judges and user simulators (no `--judge_args` / `--user_args`).
- Model settings such as `--gen_kwargs reasoning_effort=high` are allowed and recorded with the result.
- `mheval --tasks list` shows all tasks; the [mheval README](https://github.com/slingshot-ai/mheval#benchmarks) describes them.

Each full run writes leaderboard files to `results/<model>/submission/` in your mheval directory:

```
submission/
├── models/<model>.yaml          # model card template
└── results/<model>/<task>.json  # one file per benchmark
```

### 2. First submission for a model

1. Fork this repository and clone your fork.
2. Copy the submission folder into the root of your fork:
   ```bash
   cp -r <mheval>/results/<model>/submission/* <your-fork>/
   ```
3. Fill in `models/<model>.yaml` and replace every `TODO`:
   ```yaml
   name: org/model-name            # model id as called (API id or Hugging Face repo)
   display_name: Model Name        # shown on the leaderboard; optional, defaults to `name`
   organization: Example Labs
   access: open-weights            # open-weights | public-api | private
   url: https://huggingface.co/org/model-name
   submitted_by: "@your-github-handle"
   ```
4. Optionally run the checks locally: `pip install pyyaml && python scripts/validate.py`.
5. Open a pull request, one model per pull request.

### 3. Adding more benchmarks later

Run the additional tasks with the same model id. Then copy **only the new result files**, so your filled-in model card is not overwritten by the template:

```bash
cp -r <mheval>/results/<model>/submission/results/* <your-fork>/results/
```

Then open a new pull request. To update an existing result, replace its file the same way.

### What CI checks

Every pull request must pass `scripts/validate.py`, which checks each model card and result file:

- **Model card:** every field is filled in (`display_name` is optional), `access` is one of `open-weights`, `public-api` or `private`, and the file name matches the model id.
- **Result files:** each sits at `results/<model>/<task>.json` for a known benchmark, has a model card, and contains the benchmark's headline metric.
- **Released task configuration:** the result was produced by a released mheval version, and its task configuration matches that release exactly (a fingerprint of the task's files).
- **Default judges and simulators:** the run used the task's defaults.
- **Full benchmark:** no `--limit`.

A maintainer reviews and merges passing pull requests. Results are self-reported: the checks confirm *how* a result was produced, not that the outputs came from the named model.

## Repository layout

```
benchmarks.yaml                # benchmarks: group, headline metric and scale, description, breakdown views
models/<model>.yaml            # one model card per model
results/<model>/<task>.json    # one result per (model, benchmark), as written by mheval
scripts/validate.py            # submission checks (run by CI)
site/                          # Next.js + TypeScript static site, deployed to GitHub Pages
```

To preview the site locally:

```bash
cd site && npm ci && npm run dev    # http://localhost:3000
```

## License

MIT. Benchmark data, prompts and scoring belong to their original authors; see the [mheval acknowledgements](https://github.com/slingshot-ai/mheval#acknowledgements).
