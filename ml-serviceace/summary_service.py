import re


def clean_markdown(text: str) -> str:
    """
    Remove markdown badges, links, and extra symbols.
    """

    # remove images/badges
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

    # remove markdown links but keep text
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)

    # remove headings (#)
    text = re.sub(r'#', '', text)

    # remove extra symbols
    text = re.sub(r'\*', '', text)

    return text


def generate_summary(readme_text: str) -> str:
    """
    Generate a clean summary from README.
    """

    if not readme_text:
        return "No README content available."

    text = clean_markdown(readme_text)

    lines = text.split("\n")

    # remove empty lines
    lines = [line.strip() for line in lines if line.strip() != ""]

    # skip badge-heavy lines
    meaningful_lines = [
        line for line in lines
        if len(line) > 40
    ]

    summary = " ".join(meaningful_lines[:2])

    return summary