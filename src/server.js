require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const organizerRoutes = require('./routes/organizer.routes');
const participantRoutes = require('./routes/participant.routes');
const judgeRoutes = require('./routes/judge.routes');

// New RESTful routes that match the frontend service paths
const eventsRoutes = require('./routes/events.routes');
const teamsRoutes = require('./routes/teams.routes');
const submissionsRoutes = require('./routes/submissions.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const participantApiRoutes = require('./routes/participant-api.routes');
const sponsorsRoutes = require('./routes/sponsors.routes');
const aiRoutes = require('./routes/ai.routes');
const alertRoutes = require('./routes/alert.routes');
const { startAlertScheduler } = require('./services/alertScheduler');

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());
app.use(express.json());

app.use('/certificates', express.static(path.join(__dirname, '../certificates')));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// === Original routes (kept for compatibility) ===
app.use('/api/auth', authRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/judge', judgeRoutes);

// === New RESTful routes (matching frontend service paths) ===
app.use('/api/events', eventsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/participant', participantApiRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAlertScheduler();
});
