def classify_project(readme_text: str) -> str:
    """
    Classify the project type based on README keywords.
    """

    if not readme_text:
        return "Other"

    text = readme_text.lower()

    # AI / ML
    if any(word in text for word in [
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "neural network",
        "artificial intelligence"
    ]):
        return "AI/ML"

    # Web applications
    if any(word in text for word in [
        "react",
        "next.js",
        "node.js",
        "express",
        "frontend",
        "web app",
        "javascript"
    ]):
        return "Web App"

    # Mobile apps
    if any(word in text for word in [
        "android",
        "ios",
        "flutter",
        "react native",
        "mobile app"
    ]):
        return "Mobile App"

    # Blockchain
    if any(word in text for word in [
        "blockchain",
        "bitcoin",
        "ethereum",
        "crypto",
        "cryptocurrency",
        "peer-to-peer",
        "distributed ledger",
        "mining",
        "consensus",
        "node"
    ]):
        return "Blockchain"

    return "Other"