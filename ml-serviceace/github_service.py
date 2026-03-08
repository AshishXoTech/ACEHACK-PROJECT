import requests
import base64
import os
import re
import json
from datetime import datetime, timedelta, timezone
from typing import Optional

GITHUB_API = "https://api.github.com"


def _headers():
    token = os.getenv("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "devora-ml-service",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def parse_repo(repo_url: str):
    cleaned = repo_url.rstrip("/")
    if cleaned.endswith(".git"):
        cleaned = cleaned[:-4]
    parts = cleaned.split("/")
    owner = parts[-2]
    repo = parts[-1]
    return owner, repo


def fetch_file(repo_url: str, filepath: str) -> str:
    """
    Fetch any file from GitHub repo
    """
    try:
        owner, repo = parse_repo(repo_url)

        api_url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{filepath}"

        response = requests.get(api_url, headers=_headers(), timeout=10)

        if response.status_code != 200:
            return ""

        data = response.json()

        content = base64.b64decode(data["content"]).decode("utf-8")

        return content

    except Exception:
        return ""


def fetch_readme(repo_url: str) -> str:
    readme = fetch_file(repo_url, "README.md")
    if readme:
        return readme
    return fetch_file(repo_url, "readme.md")


def fetch_package_json(repo_url: str) -> str:
    return fetch_file(repo_url, "package.json")


def fetch_requirements(repo_url: str) -> str:
    return fetch_file(repo_url, "requirements.txt")


def fetch_pom_xml(repo_url: str) -> str:
    return fetch_file(repo_url, "pom.xml")


def fetch_setup_py(repo_url: str) -> str:
    return fetch_file(repo_url, "setup.py")


def detect_tech_stack(repo_url: str, readme_text: str = "") -> list[str]:
    detected: list[str] = []
    readme_lower = (readme_text or "").lower()

    package_json = fetch_package_json(repo_url)
    requirements_txt = fetch_requirements(repo_url)
    pom_xml = fetch_pom_xml(repo_url)
    setup_py = fetch_setup_py(repo_url)

    def add(name: str):
        if name not in detected:
            detected.append(name)

    if package_json:
        try:
            data = json.loads(package_json)
            deps = {}
            deps.update(data.get("dependencies", {}))
            deps.update(data.get("devDependencies", {}))
            dep_names = [d.lower() for d in deps.keys()]

            if "react" in dep_names:
                add("React")
            if "next" in dep_names or "next.js" in dep_names:
                add("Next.js")
            if "express" in dep_names:
                add("Express.js")
            if "typescript" in dep_names:
                add("TypeScript")
            if "mongoose" in dep_names or "mongodb" in dep_names:
                add("MongoDB")
            if "prisma" in dep_names:
                add("Prisma")
        except Exception:
            pass

    req_lower = requirements_txt.lower() if requirements_txt else ""
    if req_lower:
        if "fastapi" in req_lower:
            add("FastAPI")
        if "flask" in req_lower:
            add("Flask")
        if "django" in req_lower:
            add("Django")
        if "pydantic" in req_lower:
            add("Pydantic")
        if "tensorflow" in req_lower:
            add("TensorFlow")
        if "torch" in req_lower or "pytorch" in req_lower:
            add("PyTorch")
        if "sqlalchemy" in req_lower:
            add("SQLAlchemy")

    pom_lower = pom_xml.lower() if pom_xml else ""
    if pom_lower:
        add("Java")
        if "spring-boot" in pom_lower:
            add("Spring Boot")
        if "maven" in pom_lower:
            add("Maven")

    setup_lower = setup_py.lower() if setup_py else ""
    if setup_lower:
        add("Python")

    if "node" in readme_lower or "express" in readme_lower:
        add("Node.js")
    if "postgres" in readme_lower:
        add("PostgreSQL")
    if "mysql" in readme_lower:
        add("MySQL")
    if "redis" in readme_lower:
        add("Redis")
    if "docker" in readme_lower:
        add("Docker")

    return detected


def _extract_last_page(link_header: str) -> int:
    if not link_header:
        return 0

    match = re.search(r"[?&]page=(\d+)>;\s*rel=\"last\"", link_header)
    if not match:
        return 0
    return int(match.group(1))


def _count_commits(owner: str, repo: str, since: Optional[str] = None) -> int:
    params = {"per_page": 1}
    if since:
        params["since"] = since

    response = requests.get(
        f"{GITHUB_API}/repos/{owner}/{repo}/commits",
        headers=_headers(),
        params=params,
        timeout=10,
    )

    if response.status_code != 200:
        return 0

    link_header = response.headers.get("Link", "")
    last_page = _extract_last_page(link_header)
    if last_page:
        return last_page

    data = response.json()
    return len(data) if isinstance(data, list) else 0


def fetch_commit_stats(repo_url: str) -> dict:
    try:
        owner, repo = parse_repo(repo_url)
        now = datetime.now(timezone.utc)
        last7 = (now - timedelta(days=7)).isoformat().replace("+00:00", "Z")
        last30 = (now - timedelta(days=30)).isoformat().replace("+00:00", "Z")

        return {
            "total": _count_commits(owner, repo),
            "last7Days": _count_commits(owner, repo, since=last7),
            "last30Days": _count_commits(owner, repo, since=last30),
        }
    except Exception:
        return {"total": 0, "last7Days": 0, "last30Days": 0}
