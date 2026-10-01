"""Validate every model card and result file in the repository.

    python scripts/validate.py            # needs `git` and PyYAML

Each result is checked against the mheval release named in its `meta.mheval_version`: that release is cloned
(cached under .cache/), and its task fingerprints and default judges are compared with the submission.
Exits non-zero and lists every problem if anything fails.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
MHEVAL_REPO = os.environ.get("MHEVAL_REPO", "https://github.com/slingshot-ai/mheval.git")
CACHE = ROOT / ".cache"
ACCESS = {"open-weights", "public-api", "private"}
CARD_FIELDS = ("name", "organization", "access", "url", "submitted_by")

# Run inside a clone of a given mheval release: per-task fingerprint and default judge/user models.
FINGERPRINT = """
import json
from mheval.config import load_tasks, task_sha256
print(json.dumps({name: {"sha256": task_sha256(cfg),
                         "roles": {r: v.get("model") for r, v in cfg.roles.items()}}
                  for name, cfg in load_tasks().items()}))
"""


def model_id(model: str) -> str:  # same rule as mheval.submission.model_id
    return re.sub(r"[^\w.-]+", "__", model)


def release_tasks(version: str, cache: dict) -> dict:
    if version not in cache:
        checkout = CACHE / f"mheval-v{version}"
        if not checkout.exists():
            subprocess.run(["git", "-c", "advice.detachedHead=false", "clone", "-q", "--depth", "1",
                            "--branch", f"v{version}", MHEVAL_REPO, str(checkout)], check=True)
        out = subprocess.run([sys.executable, "-c", FINGERPRINT], cwd=checkout, check=True, capture_output=True,
                             text=True, env={**os.environ, "PYTHONPATH": str(checkout)})
        cache[version] = json.loads(out.stdout)
    return cache[version]


def check_card(path: Path) -> list[str]:
    try:
        card = yaml.safe_load(path.read_text()) or {}
    except yaml.YAMLError as e:
        return [f"invalid YAML: {e}"]
    errors = [f"missing `{f}`" for f in CARD_FIELDS if not card.get(f)]
    errors += [f"`{f}` is still TODO" for f in CARD_FIELDS if str(card.get(f, "")).strip() == "TODO"]
    if card.get("access") and card["access"] != "TODO" and card["access"] not in ACCESS:
        errors.append(f"`access` must be one of {sorted(ACCESS)}")
    if card.get("name") and model_id(str(card["name"])) != path.stem:
        errors.append(f"file name should be {model_id(str(card['name']))}.yaml for model `{card['name']}`")
    return errors


def check_result(path: Path, benchmarks: dict, releases: dict) -> list[str]:
    mid, task = path.parent.name, path.stem
    try:
        res = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        return [f"invalid JSON: {e}"]
    errors = []
    if not (ROOT / "models" / f"{mid}.yaml").exists():
        errors.append(f"no model card models/{mid}.yaml")
    if task not in benchmarks:
        return errors + [f"unknown benchmark `{task}` (see benchmarks.yaml)"]
    meta = res.get("meta")
    if not isinstance(meta, dict):
        return errors + ["missing `meta`: produce results with mheval >= 0.1.0"]
    metric = benchmarks[task]["metric"]
    if not isinstance(res.get("metrics", {}).get(metric), (int, float)):
        errors.append(f"missing numeric headline metric `{metric}`")
    if meta.get("task") != task:
        errors.append(f"meta.task is `{meta.get('task')}` but the file is {task}.json")
    target = (meta.get("roles") or {}).get("target", {}).get("model")
    if not target or model_id(target) != mid:
        errors.append(f"meta target model `{target}` does not match directory results/{mid}/")
    if meta.get("limit") is not None:
        errors.append(f"run used --limit {meta['limit']}; only full benchmarks are accepted")
    version = str(meta.get("mheval_version", ""))
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        return errors + [f"mheval_version `{version}` is not a release"]
    try:
        reference = release_tasks(version, releases).get(task)
    except subprocess.CalledProcessError:
        return errors + [f"mheval release v{version} not found"]
    if reference is None:
        return errors + [f"task `{task}` does not exist in mheval v{version}"]
    if meta.get("task_sha256") != reference["sha256"]:
        errors.append(f"task configuration differs from mheval v{version} (modified task files?)")
    for role in ("judge", "user"):
        used = (meta["roles"].get(role) or {}).get("model")
        default = reference["roles"].get(role)
        if used != default:
            errors.append(f"{role} `{used}` is not the task's default `{default}`")
    return errors


def main() -> int:
    benchmarks = {b["id"]: b for b in yaml.safe_load((ROOT / "benchmarks.yaml").read_text())}
    problems: dict[str, list[str]] = {}
    for card in sorted((ROOT / "models").glob("*.yaml")):
        problems[str(card.relative_to(ROOT))] = check_card(card)
    releases: dict = {}
    for result in sorted((ROOT / "results").glob("*/*.json")):
        problems[str(result.relative_to(ROOT))] = check_result(result, benchmarks, releases)
    for stray in sorted(p for p in (ROOT / "results").rglob("*") if p.is_file() and p.suffix != ".json"):
        problems[str(stray.relative_to(ROOT))] = ["only results/<model>/<task>.json files are allowed"]
    failed = {f: e for f, e in problems.items() if e}
    for f, errors in failed.items():
        for e in errors:
            print(f"::error file={f}::{e}" if os.environ.get("GITHUB_ACTIONS") else f"{f}: {e}")
    print(f"{len(problems) - len(failed)}/{len(problems)} files valid")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
