# Devora (ACEHACK Project)

Devora is a full-stack hackathon management platform for organizers, judges, and participants. It centralizes event operations, submission review, AI-assisted repository analysis, scoring, and leaderboard publishing.

## Problem Statement

Hackathon operations are often spread across forms, sheets, chats, and manual review workflows. This causes:

- Organizer overhead in registrations, assignments, and publishing results
- Judge friction while reviewing repos, demos, and documentation
- Participant uncertainty around submission status, scoring, and certificates

Devora solves this with one integrated platform and role-based dashboards.

## Core Features

### Organizer
- Event creation and lifecycle management
- Team registration and approval flow
- Judge-to-team assignment
- Submission monitoring and analytics
- Leaderboard publish controls and certificate workflows

### Judge
- Assigned teams view with submission context
- Submission details page (repo, demo, description, members)
- 4-criteria scoring (0-10 each): Innovation, Technical, Design/Presentation, Impact
- AI analysis panel for repository insights
- Real-time leaderboard visibility

### Participant
- My Hackathons listing
- Event workspace flow (team, submission, resources, certificates)
- Team creation/invite flow
- Project submission with repo + demo + description
- Dashboard stats for registered events/submissions/certificates

## AI Repository Analysis

Submission repo URLs are analyzed using a Python ML microservice.

Outputs include:
- Project summary
- Category classification
- Tech stack detection
- Commit insights (including frequency and activity patterns)

The backend caches analysis in submission fields to avoid repeated expensive calls.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind |
| Backend | Node.js, Express |
| Database | SQLite + Prisma ORM |
| Auth | JWT |
| AI/ML | Python FastAPI + OpenAI SDK + GitHub API |

## Repository Structure

```text
ACEHACK-PROJECT/
├── certificates/             # Certificate storage
├── frontend/                 # Next.js app (App Router)
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── judge/
│   │   │   ├── organizer/
│   │   │   └── participant/
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── leaderboard/
│   │   │   ├── page.tsx
│   │   │   └── [eventId]/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── my-hackathons/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIAnalysisCard.tsx
│   │   │   ├── AIAnalysisChart.tsx
│   │   │   └── TechStackTags.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsCard.tsx
│   │   │   └── TopTeams.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   └── EventGrid.tsx
│   │   ├── forms/
│   │   │   └── CreateEventForm.tsx
│   │   ├── landing/
│   │   │   ├── CTA.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── OngoingHackathons.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   ├── UpcomingHackathons.tsx
│   │   │   └── WhyHackflow.tsx
│   │   ├── layout/
│   │   │   └── DashboardShell.tsx
│   │   ├── registrations/
│   │   ├── submissions/
│   │   ├── ui/
│   │   └── workspace/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── middleware/
│   │   └── RoleGuard.tsx
│   ├── public/
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── certificate.service.ts
│   │   ├── event.service.ts
│   │   ├── judge.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── organizer.service.ts
│   │   ├── participant-workspace.service.ts
│   │   ├── participant.service.ts
│   │   ├── registration.service.ts
│   │   └── submission.service.ts
│   ├── build-zip.js
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
├── ml-serviceace/            # FastAPI ML microservice
│   ├── analyzer.py
│   ├── classification_service.py
│   ├── github_service.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── summary_service.py
│   └── __pycache__/
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20260303065159_init/
│       └── 20260305191006_add_ml_fields/
├── src/                      # Node/Express backend
│   ├── server.js
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── judge.controller.js
│   │   ├── organizer.controller.js
│   │   └── participant.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── events.routes.js
│   │   ├── judge.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── organizer.routes.js
│   │   ├── participant-api.routes.js
│   │   ├── participant.routes.js
│   │   ├── submissions.routes.js
│   │   └── teams.routes.js
│   ├── services/
│   │   ├── certificate.service.js
│   │   ├── leaderboard.service.js
│   │   └── ml.service.js
│   └── utils/
│       └── pdfGenerator.js
├── .env
├── .env.example
├── .gitignore
├── package.json              # Backend dependencies/scripts
└── README.md
```

## Local Setup

## 1) Backend (Node/Express)

```bash
npm install
cp .env.example .env   # if .env.example is available
npm run dev            # runs backend on PORT (default 5001)
```

## 2) Frontend (Next.js)

```bash
cd frontend
npm install
# create/update frontend/.env.local with API base URL
npm run dev            # default http://localhost:3000
```

Typical frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
```

## 3) Database (Prisma + SQLite)

```bash
npx prisma generate
npx prisma db push
# optional
node prisma/seed.js
```

Note: This repo has had provider-history mismatch issues in some environments. If `migrate deploy` fails with provider mismatch, use `prisma db push` for local setup.

## 4) ML Service (FastAPI)

```bash
cd ml-serviceace
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8001
```

ML service env (`ml-serviceace/.env`):

```env
OPENAI_API_KEY=your_openai_key
```

Optional backend env for ML URL:

```env
ML_SERVICE_URL=http://localhost:8001
```

## Key API Groups

- Auth: `/api/auth/*`
- Organizer: `/api/organizer/*`
- Participant: `/api/participant/*`
- Judge: `/api/judge/*`
- Events: `/api/events/*`
- Teams: `/api/teams/*`
- Submissions: `/api/submissions/*`
- Leaderboard: `/api/leaderboard/*`
- AI analysis: `/api/ai/repo-analysis/:teamId`

## Team

Built by Hack Shastra for ACEHACK.
