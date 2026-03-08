from pydantic import BaseModel, Field


class RepoRequest(BaseModel):
    repo_url: str = Field(alias="repoUrl")

    class Config:
        populate_by_name = True
