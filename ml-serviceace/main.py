import json
import os
from typing import Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI
from openai import OpenAI

from github_service import (
    detect_tech_stack,
    fetch_commit_stats,
    fetch_package_json,
    fetch_pom_xml,
    fetch_readme,
    fetch_requirements,
    fetch_setup_py,
)
from models import RepoRequest
from summary_service import generate_summary
from classification_service import classify_project
from analyzer import analyze_stack

load_dotenv()

app = FastAPI()
client = OpenAI()


def _safe_json_parse(content: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
        return {}
    except Exception:
        return {}


def _analyze_with_openai(readme_text: str, stack: list[str], commit_stats: Dict[str, int]) -> Dict[str, Any]:
    prompt = (
        "Analyze this hackathon project and return strict JSON with keys: "
        "summary, category, tech_stack, complexity, innovation_score. "
        "innovation_score must be a number from 0 to 10.\n\n"
        f"README:\n{readme_text[:12000]}\n\n"
        f"Detected Tech Stack: {stack}\n"
        f"Commit Stats: {commit_stats}\n"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a hackathon project analyzer."},
            {"role": "user", "content": prompt},
        ],
    )

    content = response.choices[0].message.content or "{}"
    print("OpenAI response:", content)
    parsed = _safe_json_parse(content)

    summary = str(parsed.get("summary") or "No summary generated.")
    category = str(parsed.get("category") or "Other")
    tech_stack = parsed.get("tech_stack")
    if not isinstance(tech_stack, list):
        tech_stack = stack
    else:
        tech_stack = [str(item) for item in tech_stack]
    complexity = str(parsed.get("complexity") or "Medium")

    try:
        innovation_score = float(parsed.get("innovation_score", 0))
    except Exception:
        innovation_score = 0.0

    return {
        "summary": summary,
        "category": category,
        "tech_stack": tech_stack,
        "complexity": complexity,
        "innovation_score": max(0.0, min(10.0, innovation_score)),
    }


@app.get("/")
def home():
    return {"message": "HackFlow AI ML Service Running"}


@app.get("/health")
def health():
    api_key = os.getenv("OPENAI_API_KEY", "")
    openai_status = "connected" if api_key.startswith("sk-") else "missing_api_key"
    return {"status": "ML service running", "openai": openai_status}


@app.post("/analyze")
def analyze_repo(req: RepoRequest):
    if "github.com" not in req.repo_url:
        return {"error": "Invalid GitHub repository URL"}

    print("Repo URL received:", req.repo_url)

    readme = fetch_readme(req.repo_url)
    package_json = fetch_package_json(req.repo_url)
    requirements = fetch_requirements(req.repo_url)
    pom_xml = fetch_pom_xml(req.repo_url)
    setup_py = fetch_setup_py(req.repo_url)

    print("README fetched:", bool(readme), "length:", len(readme))
    print(
        "Repo files fetched:",
        {
            "package.json": bool(package_json),
            "requirements.txt": bool(requirements),
            "pom.xml": bool(pom_xml),
            "setup.py": bool(setup_py),
        },
    )

    tech_stack = detect_tech_stack(req.repo_url, readme)
    commit_stats = fetch_commit_stats(req.repo_url)
    print("Commit stats:", commit_stats)

    llm_output = _analyze_with_openai(readme, tech_stack, commit_stats)

    result = {
        "summary": llm_output["summary"],
        "category": llm_output["category"],
        "tech_stack": llm_output["tech_stack"],
        "complexity": llm_output["complexity"],
        "innovation_score": llm_output["innovation_score"],
        "commit_frequency": commit_stats,
        "commitStats": commit_stats,
        "techStack": llm_output["tech_stack"],
    }
    print("Final JSON returned:", result)
    return result


# Backward-compatible endpoint currently used by backend in some flows
@app.post("/analyze-repo")
def analyze_repo_legacy(req: RepoRequest):
    return analyze_repo(req)


@app.post("/generate-summary")
def generate_summary_api(req: RepoRequest):
    readme = fetch_readme(req.repo_url)
    return {"summary": generate_summary(readme)}


@app.post("/classify-project")
def classify_project_api(req: RepoRequest):
    readme = fetch_readme(req.repo_url)
    return {"category": classify_project(readme)}


@app.post("/analyze-project-stack")
def analyze_project_stack_api(req: RepoRequest):
    readme = fetch_readme(req.repo_url)
    return analyze_stack(req.repo_url, readme)
