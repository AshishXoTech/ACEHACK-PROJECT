const prisma = require('../config/prisma');
const mlService = require("../services/ml.service");


// =========================
// CREATE TEAM
// =========================
exports.createTeam = async (req, res) => {
  try {

    const { name, eventId } = req.body;

    if (!name || !eventId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) }
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const team = await prisma.team.create({
      data: {
        name,
        eventId: Number(eventId)
      }
    });

    await prisma.registration.create({
      data: {
        teamId: team.id,
        userId: req.user.id
      }
    });

    return res.status(201).json({
      message: "Team created and registered",
      team
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// SUBMIT PROJECT + ML ANALYSIS
// =========================
exports.submitProject = async (req, res) => {

  try {

    const { teamId, repoLink, profileLink } = req.body;

    if (!teamId || !repoLink || !profileLink) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) }
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    // Check user belongs to team
    const registration = await prisma.registration.findFirst({
      where: {
        teamId: Number(teamId),
        userId: req.user.id
      }
    });

    if (!registration) {
      return res.status(403).json({
        message: "You are not part of this team"
      });
    }


    // =========================
    // CALL ML SERVICE
    // =========================

    let summary = null;
    let techStack = null;
    let complexity = null;
    let classification = null;
    let usabilityScore = null;

    try {

      // 1️⃣ Generate Summary
      const summaryResult = await mlService.generateSummary(repoLink);

      summary = summaryResult.summary || null;


      // 2️⃣ Classify Project
      const classificationResult =
        await mlService.classifyProject(repoLink);

      classification = classificationResult.category || null;


      // 3️⃣ Analyze Tech Stack
      const stackResult =
        await mlService.analyzeStack(repoLink);

      techStack = stackResult.tech_stack || null;
      complexity = stackResult.complexity || null;
      usabilityScore = stackResult.usability_score || null;

    } catch (mlError) {

      console.error("ML service failed:", mlError.message);

    }


    const existingSubmission = await prisma.submission.findUnique({
      where: { teamId: Number(teamId) }
    });


    // =========================
    // UPDATE IF EXISTS
    // =========================

    if (existingSubmission) {

      const updatedSubmission = await prisma.submission.update({
        where: { teamId: Number(teamId) },
        data: {
          repoLink,
          profileLink,
          summary,
          techStack,
          complexity,
          classification,
          usabilityScore,
          status: "submitted"
        }
      });

      return res.json({
        message: "Submission updated successfully",
        submission: updatedSubmission
      });

    }


    // =========================
    // CREATE NEW SUBMISSION
    // =========================

    const submission = await prisma.submission.create({

      data: {

        team: {
          connect: { id: Number(teamId) }
        },

        repoLink,
        profileLink,
        summary,
        techStack,
        complexity,
        classification,
        usabilityScore,
        status: "submitted"

      }

    });


    return res.status(201).json({
      message: "Project submitted successfully",
      submission
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }

};