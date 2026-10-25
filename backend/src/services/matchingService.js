/**
 * HireFlow Evidence-Based Matching Engine
 *
 * Deterministic Scoring Methodology (100-Point Model):
 * 1. Required Skills & Evidence (Max 50 or 60 points):
 *    - Skills backed by concrete evidence (project, contribution, repo URL): full weight.
 *    - Skills claimed on candidate profile without evidence: 50% partial weight.
 *    - Required skills missing entirely: 0%.
 * 2. Optional / Preferred Skills (Max 10 points):
 *    - Bonus alignment for secondary skills. If none specified by job, points shift to required skills.
 * 3. Experience Requirements (Max 20 points):
 *    - Real calculated employment history years vs. job.experienceMin.
 * 4. Demonstrable Projects (Max 10 points):
 *    - Documented portfolio items and code repositories.
 * 5. Education Alignment (Max 10 points):
 *    - Degree, field of study, or institutional records.
 */

function normalize(items) {
  return [...new Set((items || []).filter((v) => typeof v === "string").map((v) => v.trim().toLowerCase()).filter(Boolean))];
}

function calculateMatch(profile = {}, job = {}) {
  const candidateSkills = normalize(profile.skills);
  const evidenceList = Array.isArray(profile.skillEvidence) ? profile.skillEvidence : [];
  const projectList = Array.isArray(profile.projects) ? profile.projects : [];
  const experienceList = Array.isArray(profile.experience) ? profile.experience : [];
  const educationList = Array.isArray(profile.education) ? profile.education : [];

  const requiredSkills = normalize(job.skills);
  const optionalSkills = normalize(job.optionalSkills);

  // Check which skills have attached evidence
  const evidenceSkillsSet = new Set(
    evidenceList.map((e) => (typeof e.skill === "string" ? e.skill.trim().toLowerCase() : "")).filter(Boolean)
  );

  // Map required skills into 3 categories
  const demonstratedWithEvidence = [];
  const claimedWithoutEvidence = [];
  const notDemonstrated = [];

  for (const reqSkill of requiredSkills) {
    // Check if evidence exists for this skill or if a project specifically lists it
    const matchingEvidence = evidenceList.filter(
      (e) => (e.skill || "").trim().toLowerCase() === reqSkill
    );
    const matchingProjects = projectList.filter((p) =>
      (p.technologies || []).some((t) => t.trim().toLowerCase() === reqSkill)
    );

    const hasConcreteEvidence = matchingEvidence.length > 0 || matchingProjects.some((p) => p.repositoryUrl || p.projectUrl);

    if (hasConcreteEvidence) {
      demonstratedWithEvidence.push({
        skill: reqSkill,
        evidenceCount: matchingEvidence.length,
        evidenceItems: matchingEvidence.map((e) => ({
          title: e.title,
          evidenceType: e.evidenceType,
          url: e.url,
          contribution: e.contribution,
          verificationStatus: e.verificationStatus || "self_reported"
        })),
        projectReferences: matchingProjects.map((p) => ({
          name: p.name,
          url: p.repositoryUrl || p.projectUrl
        }))
      });
    } else if (candidateSkills.includes(reqSkill)) {
      claimedWithoutEvidence.push({
        skill: reqSkill,
        note: "Skill claimed in profile, but no project, contribution, or repository evidence attached."
      });
    } else {
      notDemonstrated.push({
        skill: reqSkill,
        note: "Required by job, but not demonstrated or claimed in profile."
      });
    }
  }

  // Optional skills breakdown
  const optionalSkillsMatched = [];
  const optionalSkillsMissing = [];
  for (const optSkill of optionalSkills) {
    if (candidateSkills.includes(optSkill) || evidenceSkillsSet.has(optSkill)) {
      optionalSkillsMatched.push(optSkill);
    } else {
      optionalSkillsMissing.push(optSkill);
    }
  }

  // Calculate skill score
  const maxRequiredPoints = optionalSkills.length > 0 ? 50 : 60;
  let skillScore = 0;
  if (requiredSkills.length > 0) {
    const fullCreditCount = demonstratedWithEvidence.length;
    const halfCreditCount = claimedWithoutEvidence.length * 0.5;
    const rawShare = (fullCreditCount + halfCreditCount) / requiredSkills.length;
    skillScore = Math.round(rawShare * maxRequiredPoints);
  } else {
    // If job specified no required skills, award neutral baseline
    skillScore = Math.round(maxRequiredPoints * 0.6);
  }

  // Calculate optional skill score (Max 10 points)
  let optionalScore = 0;
  if (optionalSkills.length > 0) {
    optionalScore = Math.round((optionalSkillsMatched.length / optionalSkills.length) * 10);
  }

  // Calculate experience years
  const experienceYears = experienceList.reduce((total, exp) => {
    const start = exp.startDate ? new Date(exp.startDate) : null;
    const end = exp.isCurrentlyWorking ? new Date() : (exp.endDate ? new Date(exp.endDate) : null);
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return total;
    }
    return total + (end - start) / (365.25 * 24 * 60 * 60 * 1000);
  }, 0);

  const roundedExpYears = Math.round(experienceYears * 10) / 10;
  const minYears = Number(job.experienceMin || 0);
  let experienceScore = 20;
  if (minYears > 0) {
    experienceScore = Math.round(Math.min(roundedExpYears / minYears, 1) * 20);
  }

  // Calculate projects score (Max 10 points)
  const projectsWithEvidence = projectList.filter((p) => p.description && (p.projectUrl || p.repositoryUrl || (p.technologies && p.technologies.length > 0)));
  const totalEvidenceItems = evidenceList.length + projectsWithEvidence.length;
  const projectScore = Math.min(Math.round(totalEvidenceItems * 3), 10);

  // Calculate education score (Max 10 points)
  const educationScore = educationList.length > 0 ? 10 : 0;

  // Overall match score (0 - 100)
  const overallScore = Math.max(0, Math.min(100, skillScore + optionalScore + experienceScore + projectScore + educationScore));

  // Profile Completeness and Confidence Check
  let profileSignals = 0;
  if (profile.headline) profileSignals += 15;
  if (profile.bio) profileSignals += 15;
  if (candidateSkills.length >= 3) profileSignals += 25;
  if (experienceList.length > 0) profileSignals += 20;
  if (projectList.length > 0 || evidenceList.length > 0) profileSignals += 25;
  const profileCompleteness = Math.min(100, profileSignals);
  const isProfileIncomplete = profileCompleteness < 40;

  // Generate deterministic Skill Gap Action Plan
  const actionPlan = [];
  for (const item of notDemonstrated) {
    actionPlan.push({
      priority: "high",
      type: "missing_skill",
      skill: item.skill,
      recommendation: `Develop a portfolio project or demonstrate practical capability in ${item.skill}.`,
      action: `Add evidence or a project utilizing ${item.skill} to meet this required criterion.`
    });
  }

  for (const item of claimedWithoutEvidence) {
    actionPlan.push({
      priority: "medium",
      type: "unverified_skill",
      skill: item.skill,
      recommendation: `Provide supporting proof for ${item.skill} (such as a GitHub repository, project link, or contribution summary).`,
      action: `Link a demonstrable project or contribution demonstrating hands-on experience in ${item.skill}.`
    });
  }

  if (minYears > 0 && roundedExpYears < minYears) {
    actionPlan.push({
      priority: "medium",
      type: "experience_gap",
      skill: "Industry Experience",
      recommendation: `Position requires ~${minYears} years of experience; your profile currently demonstrates ${roundedExpYears} years.`,
      action: "Emphasize high-impact deliverables, architectural ownership, or production scope in your project descriptions."
    });
  }

  if (projectList.length === 0 && evidenceList.length === 0) {
    actionPlan.push({
      priority: "high",
      type: "evidence_needed",
      skill: "Portfolio & Code Artifacts",
      recommendation: "Recruiters evaluate verified evidence rather than self-reported lists.",
      action: "Add at least one portfolio project or code repository link to your profile."
    });
  }

  return {
    score: overallScore,
    isProfileIncomplete,
    profileCompleteness,
    confidenceDisclosure: isProfileIncomplete
      ? "Preliminary Match: Your profile is missing key experience or project evidence. Add supporting details for an accurate evaluation."
      : "Complete Evidence Match: Based on demonstrable skills, experience history, and profile evidence.",
    formulaExplanation: {
      requiredSkillsWeight: maxRequiredPoints,
      optionalSkillsWeight: optionalSkills.length > 0 ? 10 : 0,
      experienceWeight: 20,
      projectsWeight: 10,
      educationWeight: 10,
      methodology: "Evidence-weighted deterministic matching: Required skills backed by demonstrable projects receive full credit; unverified self-reported skills receive partial credit; missing skills receive 0."
    },
    breakdown: {
      requiredSkills: {
        score: skillScore,
        max: maxRequiredPoints,
        totalRequired: requiredSkills.length,
        demonstratedWithEvidence,
        claimedWithoutEvidence,
        notDemonstrated
      },
      optionalSkills: {
        score: optionalScore,
        max: optionalSkills.length > 0 ? 10 : 0,
        totalOptional: optionalSkills.length,
        matched: optionalSkillsMatched,
        missing: optionalSkillsMissing
      },
      experience: {
        score: experienceScore,
        max: 20,
        candidateYears: roundedExpYears,
        requiredYears: minYears,
        meetsRequirement: roundedExpYears >= minYears
      },
      projects: {
        score: projectScore,
        max: 10,
        count: projectList.length,
        evidenceCount: totalEvidenceItems
      },
      education: {
        score: educationScore,
        max: 10,
        count: educationList.length,
        hasDegree: educationList.length > 0
      }
    },
    actionPlan
  };
}

module.exports = { calculateMatch, normalize };
