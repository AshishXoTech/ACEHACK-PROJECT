🚀 HackFlow AI
A centralized platform that streamlines hackathon management, simplifies the judging workflow, and enhances the experience for organizers, judges, and participants.

📌 Problem Statement
Hackathons are one of the most powerful platforms for innovation — but organizing and managing them remains highly manual, fragmented, and inefficient.

Organizers juggle multiple disconnected tools (Google Forms, spreadsheets, email, messaging apps) to handle registrations, submissions, judge assignments, and scoring — leading to heavy administrative overhead and poor coordination.

Judges face challenges during evaluation, with project repositories, demo videos, and documentation scattered across different links, making fair and consistent scoring difficult.

Participants lack transparency in the submission and judging process, with no clear visibility into their evaluation status or easy access to results and certificates.

HackFlow AI addresses all of these pain points through a single, intelligent platform.

✨ Features
For Organizers
📋 Centralized registration and team management
📁 Unified project submission tracking
⚖️ Automated judge assignment and workload balancing
📊 Real-time event progress dashboard
🏆 Certificate generation and results publishing
For Judges
🗂️ Structured evaluation dashboard with all project assets in one place
📝 Consistent, rubric-based scoring system
🔄 Easy project comparison and review workflow
📈 Scoring analytics and progress tracking
For Participants
📤 Simple, guided project submission flow
🔍 Real-time visibility into evaluation status
🎓 Automated certificate access upon results
🔔 Event updates and notifications
🛠️ Tech Stack
Layer	Technology
Frontend	React.js / Next.js
Backend	Node.js / Express
Database	PostgreSQL / MongoDB
Auth	OAuth 2.0 / JWT
AI/ML	OpenAI API / Custom Models
Storage	AWS S3 / Cloudinary
Deployment	Docker / Vercel / AWS
⚠️ Tech stack is subject to change based on development decisions.

🏗️ Architecture Overview
┌─────────────────────────────────────────────────┐
│                   HackFlow AI                   │
├───────────────┬─────────────────┬───────────────┤
│   Organizer   │     Judge       │  Participant  │
│   Dashboard   │   Dashboard     │   Dashboard   │
├───────────────┴─────────────────┴───────────────┤
│              Core Application Layer             │
│  Registration │ Submissions │ Scoring │ Certs   │
├─────────────────────────────────────────────────┤
│               AI / Automation Layer             │
│  Judge Assignment │ Scoring Insights │ Notifs  │
├─────────────────────────────────────────────────┤
│                  Data Layer                     │
│          Database │ File Storage │ Cache        │
└─────────────────────────────────────────────────┘
🚀 Getting Started
Prerequisites
Node.js >= 18.x
npm or yarn
PostgreSQL (or Docker)
Installation
# Clone the repository
git clone https://github.com/your-org/hackflow-ai.git
cd hackflow-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
The app will be available at http://localhost:3000.

⚙️ Environment Variables
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hackflow

# Auth
JWT_SECRET=your_jwt_secret
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# AI
OPENAI_API_KEY=your_openai_key

📁 Project Structure
ACEHACK-PROJECT/
├── frontend/                      # Frontend application (React / Next.js UI)
│   ├── app/                       # App router pages and route-based layouts
│   ├── components/                # Reusable UI components (cards, tables, navbar, sidebar)
│   ├── context/                   # Global state management (Auth, user roles, sessions)
│   ├── middleware/                # Route guards and role-based access control
│   ├── public/                    # Static assets (images, icons, logos)
│   ├── services/                  # API service layer for backend communication
│   ├── .env.local                 # Frontend environment variables
│   └── package.json               # Frontend dependencies and scripts
│
├── src/                           # Backend application (Node.js / Express API)
│   ├── config/                    # Server configuration (DB config, environment setup)
│   ├── controllers/               # Request handlers for API endpoints
│   ├── middleware/                # Authentication, authorization, validation middleware
│   ├── routes/                    # Express route definitions
│   ├── services/                  # Core business logic and integrations
│   ├── utils/                     # Helper utilities (validation, formatting, helpers)
│   └── server.js                  # Main backend server entry point
│
├── prisma/                        # Database layer using Prisma ORM
│   ├── migrations/                # Database schema migration history
│   ├── schema.prisma              # Prisma database schema definition
│   ├── seed.js                    # Script to seed database with initial data
│   └── dev.db                     # SQLite development database
│
├── ml-serviceace/                 # AI microservice for project analysis
│   ├── main.py                    # FastAPI server entry point
│   ├── github_service.py          # GitHub API integration (repo data extraction)
│   ├── analyzer.py                # Core repository analysis engine
│   ├── classification_service.py  # Project category classification (AI / ML / Web / etc.)
│   ├── summary_service.py         # AI-generated project summaries
│   ├── models.py                  # Data models for ML service
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # ML service environment configuration
│
├── certificates/                  # Generated hackathon certificates storage
│
├── .env                           # Global backend environment variables
├── .env.example                   # Example environment configuration template
├── package.json                   # Root project scripts and dependencies
└── README.md                      # Project documentation

🧪 Running Tests
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/your-feature)
Commit your changes (git commit -m 'Add your feature')
Push to the branch (git push origin feature/your-feature)
Open a Pull Request
Please read CONTRIBUTING.md for our code of conduct and contribution guidelines.

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

👥 Team
Built with ❤️ at [Hackathon Name] by [Your Team Name].

Name	Role	GitHub
—	Full Stack	—
—	Backend	—
—	Frontend	—
—	AI/ML	—
📬 Contact
For questions or feedback, reach out at your-email@example.com or open an issue on GitHub.

Made with ❤️ by the HackFlow AI Team
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
