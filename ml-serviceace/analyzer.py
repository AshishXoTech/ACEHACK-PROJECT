import json
from github_service import fetch_package_json, fetch_requirements


def analyze_stack(repo_url: str, readme_text: str):

    frontend = []
    backend = []
    database = []
    ai = []

    text = readme_text.lower() if readme_text else ""
    repo_name = repo_url.split("/")[-1].lower()

    # -------- README detection --------

    if any(x in text for x in ["react", "next.js", "vue", "angular"]):
        frontend.append("React")

    if any(x in text for x in ["node", "express", "backend", "api"]):
        backend.append("Node.js")

    if any(x in text for x in ["mongodb", "mongoose"]):
        database.append("MongoDB")

    if any(x in text for x in ["postgres", "postgresql"]):
        database.append("PostgreSQL")

    if any(x in text for x in ["mysql"]):
        database.append("MySQL")

    if any(x in text for x in ["tensorflow", "pytorch", "machine learning"]):
        ai.append("Machine Learning")

    # -------- Repo name detection --------

    if "mern" in repo_name:
        frontend.append("React")
        backend.append("Node.js")
        database.append("MongoDB")

    if "mean" in repo_name:
        frontend.append("Angular")
        backend.append("Node.js")
        database.append("MongoDB")

    if "django" in repo_name:
        backend.append("Django")

    if "fastapi" in repo_name:
        backend.append("FastAPI")

    # -------- package.json detection --------

    package_json = fetch_package_json(repo_url)

    if package_json:
        try:
            data = json.loads(package_json)

            deps = {}
            deps.update(data.get("dependencies", {}))
            deps.update(data.get("devDependencies", {}))

            deps = [d.lower() for d in deps.keys()]

            if "react" in deps:
                frontend.append("React")

            if "next" in deps:
                frontend.append("Next.js")

            if "express" in deps:
                backend.append("Express.js")

            if "mongoose" in deps:
                database.append("MongoDB")

        except Exception:
            pass

    # -------- requirements.txt detection --------

    requirements = fetch_requirements(repo_url)

    if requirements:
        r = requirements.lower()

        if "fastapi" in r:
            backend.append("FastAPI")

        if "django" in r:
            backend.append("Django")

        if "flask" in r:
            backend.append("Flask")

        if "pytorch" in r or "tensorflow" in r:
            ai.append("Machine Learning")

    # remove duplicates
    frontend = list(set(frontend))
    backend = list(set(backend))
    database = list(set(database))
    ai = list(set(ai))

    return {
        "frontend": frontend,
        "backend": backend,
        "database": database,
        "ai_used_in": ai
    }