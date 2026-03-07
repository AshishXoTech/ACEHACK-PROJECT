import requests
import base64


def parse_repo(repo_url: str):
    parts = repo_url.rstrip("/").split("/")
    owner = parts[-2]
    repo = parts[-1]
    return owner, repo


def fetch_file(repo_url: str, filepath: str) -> str:
    """
    Fetch any file from GitHub repo
    """
    try:
        owner, repo = parse_repo(repo_url)

        api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{filepath}"

        response = requests.get(api_url)

        if response.status_code != 200:
            return ""

        data = response.json()

        content = base64.b64decode(data["content"]).decode("utf-8")

        return content

    except Exception:
        return ""


def fetch_readme(repo_url: str) -> str:
    return fetch_file(repo_url, "README.md")


def fetch_package_json(repo_url: str) -> str:
    return fetch_file(repo_url, "package.json")


def fetch_requirements(repo_url: str) -> str:
    return fetch_file(repo_url, "requirements.txt")