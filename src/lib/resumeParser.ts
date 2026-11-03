/**
 * Resume Parser - Converts unstructured resume input into structured JSON
 * Suitable for auto-filling resume form fields
 */

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface Internship {
  role: string;
  company: string;
  description: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
}

export interface Education {
  degree: string;
  university: string;
  year: string;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  internships: Internship[];
  projects: Project[];
  education: Education;
  certifications: string[];
  achievements: string[];
}

/**
 * Parse unstructured resume text into structured JSON
 * @param text - Raw resume text
 * @returns Parsed resume object
 */
export function parseResume(text: string): ParsedResume {
  const result: ParsedResume = {
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
    experience: [],
    internships: [],
    projects: [],
    education: { degree: "", university: "", year: "" },
    certifications: [],
    achievements: [],
  };

  // Extract name (usually first line or after "I'm")
  const nameMatch = text.match(/I'm\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (nameMatch) result.name = nameMatch[1];

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) result.email = emailMatch[1];

  // Extract phone (optional)
  const phoneMatch = text.match(/\+?1?\s*\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // Extract skills (technical only, not certifications)
  const skillsMatch = text.match(
    /skills?\s*:?\s*([^.]*?)(?:certifications?|experience|projects?|education|internships?|$)/i,
  );
  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    result.skills = skillsText
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.match(/architect|master|certified|aws|google|scrum/i));
  }

  // Extract certifications - look for certified keywords
  const certKeywords = [
    "AWS",
    "Architect",
    "Professional",
    "Scrum Master",
    "certified",
    "certification",
    "GCP",
    "Azure",
    "CPA",
    "CISSP",
    "PMP",
  ];
  const certMatches = text.match(
    new RegExp(
      `(${certKeywords.join("|")})\\s*(?:Certified|Certificate|Certification)?[^.]*`,
      "gi",
    ),
  );
  if (certMatches) {
    result.certifications = certMatches.map((c) => c.trim()).filter((c) => c.length > 2);
  }

  // Extract achievements - look for achievement keywords
  const achieveKeywords = [
    "award",
    "awarded",
    "achievement",
    "recognition",
    "recognized",
    "published",
  ];
  if (new RegExp(achieveKeywords.join("|"), "i").test(text)) {
    const achieveMatch = text.match(
      new RegExp(`(?:${achieveKeywords.join("|")})\\s+[^.]+\\.`, "gi"),
    );
    if (achieveMatch) {
      result.achievements = achieveMatch.map((a) => a.trim()).filter((a) => a.length > 5);
    }
  }

  // Extract experience - look for role/company mentions with dates
  const expKeywords = [
    "engineer",
    "manager",
    "developer",
    "architect",
    "analyst",
    "designer",
    "lead",
    "senior",
    "junior",
    "director",
  ];

  // Look for sentences with job title + company + date
  const expMatches = text.match(
    new RegExp(`(?:${expKeywords.join("|")})\\s+[^.]*(?:at|@)\\s+\\w+[^.]*\\d{4}?`, "gi"),
  );
  if (expMatches) {
    expMatches.forEach((exp) => {
      const roleMatch = exp.match(
        /(Senior|Lead|Principal|Junior)?\s*(\w+(?:\s+\w+)?)\s+(?:at|@|,)\s+(\w+)/i,
      );
      const durationMatch = exp.match(/(\d{4})[–-]?(?:\s*(?:to|–|-))?\s*(\d{4}|present|now)/i);

      if (roleMatch && !roleMatch[2].match(/internship|intern|dashboard|built/i)) {
        result.experience.push({
          role: `${roleMatch[1] || ""} ${roleMatch[2]}`.trim(),
          company: roleMatch[3],
          duration: durationMatch ? `${durationMatch[1]}–${durationMatch[2]}` : "",
          description: exp.replace(/^[^:]*:?\s*/, "").trim(),
          technologies: extractTechnologies(exp),
        });
      }
    });
  }

  // Fallback: also look for natural mentions like "Senior Engineer at Acme since 2021"
  if (result.experience.length === 0) {
    const naturalExpMatch = text.match(
      /(.{0,50}(?:engineer|manager|developer|architect).{0,150}(?:2\d{3}|present|since|from))/gi,
    );
    if (naturalExpMatch) {
      naturalExpMatch.forEach((exp) => {
        const roleMatch = exp.match(
          /(Senior|Lead|Principal|Junior)?\s*(\w+(?:\s+\w+)?)\s+(?:at|@|,)\s+(\w+)/i,
        );
        if (roleMatch && !roleMatch[2].match(/internship|intern/i)) {
          result.experience.push({
            role: `${roleMatch[1] || ""} ${roleMatch[2]}`.trim(),
            company: roleMatch[3],
            duration: "",
            description: exp.trim(),
            technologies: extractTechnologies(exp),
          });
        }
      });
    }
  }

  // Extract internships - look for internship keywords and company names
  const internKeywords = ["intern", "internship", "placement"];
  const internCompanies = [
    "Stripe",
    "MIT",
    "Google",
    "Microsoft",
    "Amazon",
    "Facebook",
    "Meta",
    "Apple",
    "Netflix",
    "Uber",
  ];

  // Look for explicit internship mentions
  const internMatches = text.match(new RegExp(`(?:${internKeywords.join("|")})\\s+[^.]+`, "gi"));
  if (internMatches) {
    internMatches.forEach((match) => {
      // Try to find company name in the match
      const companyMatch = match.match(
        new RegExp(`(?:at|@)\\s+(${internCompanies.join("|")}|\\w+)`, "i"),
      );
      if (companyMatch) {
        result.internships.push({
          role:
            match
              .replace(/^internship|intern at|placement|internship at/i, "")
              .split(" at ")[0]
              .trim() || "Intern",
          company: companyMatch[1],
          description: match.trim(),
        });
      }
    });
  }

  // Also look for mentions of common internship companies
  internCompanies.forEach((company) => {
    const companyRegex = new RegExp(`(?:intern|internship)\\s+(?:at|@)\\s+${company}[^.]*`, "gi");
    const matches = text.match(companyRegex);
    if (
      matches &&
      !result.internships.find((i) => i.company.toLowerCase() === company.toLowerCase())
    ) {
      matches.forEach((match) => {
        result.internships.push({
          role: "Intern",
          company: company,
          description: match.trim(),
        });
      });
    }
  });

  // Extract projects - look for project keywords like built, developed, created, designed
  const projectKeywords = [
    "built",
    "developed",
    "created",
    "designed",
    "project",
    "app",
    "application",
    "dashboard",
    "system",
    "tool",
  ];
  const projectMatches = text.match(new RegExp(`(?:${projectKeywords.join("|")})\\s+[^.]+`, "gi"));
  if (projectMatches) {
    projectMatches.forEach((match) => {
      // Skip if it's part of experience description
      if (!match.match(/engineer|manager|developer|architect|role|position/i)) {
        result.projects.push({
          title:
            match
              .replace(/^(?:built|developed|created|designed|project)\s+/i, "")
              .split(" using ")[0]
              .trim() || "Project",
          description: match.trim(),
          technologies: extractTechnologies(match),
        });
      }
    });
  }

  // Extract education
  const degreePatterns = ["BSc", "BA", "BS", "MS", "MSc", "PhD", "Bachelor", "Master", "Diploma"];
  const eduRegex = new RegExp(
    `(${degreePatterns.join("|")})\\s+(?:in\\s+)?([^,]+)\\s+(?:from|at|,)?\\s*([^,]*(?:University|College|Institute)[^,]*)\\s*\\(?([^)]*\\d{4})?`,
    "i",
  );

  const eduMatch = text.match(eduRegex);
  if (eduMatch) {
    result.education.degree = `${eduMatch[1]} in ${eduMatch[2]}`;
    result.education.university = eduMatch[3].trim();
    if (eduMatch[4]) result.education.year = eduMatch[4].match(/\d{4}/)?.[0] || "";
  }

  // Fallback: look for any university mention with year
  if (!result.education.university) {
    const uniMatch = text.match(
      /(?:from|at|studied)\s+([^,]*(?:University|College|Institute)[^,]*)\s*\(?(\d{4})\)?/i,
    );
    if (uniMatch) {
      result.education.university = uniMatch[1].trim();
      result.education.year = uniMatch[2];
    }
  }

  // Generate summary if not present
  if (!result.summary && result.name && result.experience.length > 0) {
    const yearsExp = result.experience.length;
    const topTech = result.skills.slice(0, 3).join(", ");
    result.summary = `Experienced engineer with ${yearsExp}+ years building scalable solutions. Proficient in ${topTech}. Focused on delivering high-quality systems.`;
  }

  return result;
}

/**
 * Extract technologies from text
 */
function extractTechnologies(text: string): string[] {
  const techKeywords = [
    "TypeScript",
    "JavaScript",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "GraphQL",
    "REST",
    "API",
    "Linux",
    "Git",
    "CI/CD",
    "Terraform",
    "Microservices",
    "Scalable",
  ];

  return techKeywords.filter((tech) => new RegExp(`\\b${tech}\\b`, "i").test(text));
}

/**
 * Convert ParsedResume to ResumeData format for the form
 */
export function convertToResumeData(parsed: ParsedResume) {
  const inferredUserType =
    parsed.experience.length > 0
      ? "professional"
      : parsed.projects.length > 0 || parsed.internships.length > 0
        ? "college"
        : "school";

  const highestEducation =
    parsed.education.degree ||
    (inferredUserType === "school"
      ? "12th"
      : inferredUserType === "college"
        ? "Bachelor's Degree"
        : "Bachelor's Degree");

  return {
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    user_type: inferredUserType,
    detected_user_type: inferredUserType,
    highest_education: highestEducation,
    is_studying: inferredUserType !== "professional",
    years_of_experience: parsed.experience.length,
    summary: parsed.summary,
    skills: parsed.skills.join(", "),
    experience: parsed.experience
      .map((exp) => `${exp.role} at ${exp.company} (${exp.duration})\n${exp.description}`)
      .join("\n\n"),
    internships: parsed.internships
      .map((int) => `${int.role} at ${int.company}\n${int.description}`)
      .join("\n\n"),
    projects: parsed.projects.map((proj) => `${proj.title}\n${proj.description}`).join("\n\n"),
    education: `${parsed.education.degree} from ${parsed.education.university} (${parsed.education.year})`,
    certifications: parsed.certifications.join(", "),
    achievements: parsed.achievements.join(", "),
  };
}
