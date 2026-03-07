from fastapi import FastAPI
from models import RepoRequest

from github_service import fetch_readme
from summary_service import generate_summary
from classification_service import classify_project
from analyzer import analyze_stack

app = FastAPI()


@app.get("/")
def home():
    return {"message": "HackFlow AI ML Service Running"}


@app.get("/health")
def health():
    return {"status": "ML service running"}


@app.post("/generate-summary")
def generate_summary_api(req: RepoRequest):

    if "github.com" not in req.repo_url:
        return {"error": "Invalid GitHub repository URL"}

    readme = fetch_readme(req.repo_url)

    summary = generate_summary(readme)

    return {"summary": summary}


@app.post("/classify-project")
def classify_project_api(req: RepoRequest):

    if "github.com" not in req.repo_url:
        return {"error": "Invalid GitHub repository URL"}

    readme = fetch_readme(req.repo_url)

    category = classify_project(readme)

    return {"category": category}


@app.post("/analyze-project-stack")
def analyze_project_stack_api(req: RepoRequest):

    if "github.com" not in req.repo_url:
        return {"error": "Invalid GitHub repository URL"}

    readme = fetch_readme(req.repo_url)

    stack = analyze_stack(req.repo_url, readme)

    return stack