export const ACTION_VERBS: Record<string, string[]> = {
  Leadership: [
    "Led",
    "Directed",
    "Mentored",
    "Coordinated",
    "Supervised",
    "Championed",
    "Organised",
    "Guided",
    "Spearheaded",
    "Oversaw",
  ],
  Technical: [
    "Built",
    "Developed",
    "Engineered",
    "Automated",
    "Deployed",
    "Debugged",
    "Architected",
    "Integrated",
    "Migrated",
    "Configured",
  ],
  Results: [
    "Increased",
    "Reduced",
    "Improved",
    "Accelerated",
    "Saved",
    "Delivered",
    "Boosted",
    "Achieved",
    "Exceeded",
    "Generated",
  ],
  Communication: [
    "Presented",
    "Negotiated",
    "Authored",
    "Collaborated",
    "Advised",
    "Persuaded",
    "Facilitated",
    "Documented",
    "Briefed",
    "Liaised",
  ],
  Analysis: [
    "Analysed",
    "Evaluated",
    "Researched",
    "Forecasted",
    "Identified",
    "Measured",
    "Audited",
    "Modelled",
    "Diagnosed",
    "Benchmarked",
  ],
  Creative: [
    "Designed",
    "Created",
    "Conceptualised",
    "Launched",
    "Produced",
    "Illustrated",
    "Branded",
    "Composed",
    "Prototyped",
    "Redesigned",
  ],
  Finance: [
    "Budgeted",
    "Reconciled",
    "Forecast",
    "Invoiced",
    "Allocated",
    "Audited",
    "Reported",
    "Capitalised",
    "Negotiated",
    "Appraised",
  ],
  Teaching: [
    "Taught",
    "Coached",
    "Trained",
    "Tutored",
    "Mentored",
    "Assessed",
    "Inspired",
    "Instructed",
    "Evaluated",
    "Demonstrated",
  ],
  Operations: [
    "Streamlined",
    "Standardised",
    "Scheduled",
    "Maintained",
    "Procured",
    "Optimised",
    "Monitored",
    "Dispatched",
    "Inspected",
    "Expedited",
  ],
  "Customer care": [
    "Resolved",
    "Supported",
    "Served",
    "Retained",
    "Onboarded",
    "Responded",
    "Assisted",
    "Escalated",
    "Surveyed",
    "Welcomed",
  ],
};

export const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  Behavioural: [
    "Tell me about a time you worked under a tight deadline.",
    "Describe a disagreement with a teammate and how you resolved it.",
    "Give an example of a goal you set and how you reached it.",
    "Tell me about a mistake you made and what you learned from it.",
    "Describe a time you received difficult feedback.",
  ],
  Technical: [
    "Walk me through a project you are most proud of and the decisions you made.",
    "How do you debug a problem you have never seen before?",
    "How would you explain a technical idea to someone with no background?",
    "What tools or languages are you learning right now, and why?",
    "How do you decide when a solution is good enough to ship?",
  ],
  "HR and fit": [
    "Tell me about yourself.",
    "Why do you want to work here?",
    "Where do you see yourself in three years?",
    "What are your strengths and one area you are improving?",
    "What kind of working environment helps you do your best work?",
  ],
  Students: [
    "What did you enjoy most about your course or school projects?",
    "Describe a team activity you took part in and your role.",
    "Why did you choose this field?",
    "How do you balance studies with other commitments?",
    "What is the most challenging assignment you have completed?",
  ],
  Leadership: [
    "Describe a time you led a team through a difficult period.",
    "How do you motivate someone who is losing interest in their work?",
    "Tell me about a decision you made without full information.",
    "How do you delegate tasks and follow up?",
    "Describe how you handle conflict between two team members.",
  ],
  "Problem solving": [
    "Describe a complex problem you solved and your approach.",
    "Tell me about a time you found a better way to do a routine task.",
    "How do you prioritise when everything seems urgent?",
    "Describe a time a plan failed and what you did next.",
    "How do you check that your solution actually fixed the problem?",
  ],
  "Sales and customers": [
    "Tell me about a time you turned around an unhappy customer.",
    "How do you handle a customer who says no?",
    "Describe how you build trust with a new client.",
    "Tell me about a target you exceeded and how.",
    "How do you stay organised when managing many accounts?",
  ],
  "Career change": [
    "Why are you moving into this field?",
    "Which of your past skills transfer best to this role?",
    "How have you prepared yourself for the change?",
    "What worries you most about switching, and how will you handle it?",
    "How will you add value in your first ninety days?",
  ],
};

export const CAREER_TIPS = [
  {
    title: "Tailor every application",
    text: "Mirror two or three key terms from the job posting in your summary and skills, as long as they are true.",
  },
  {
    title: "Lead with impact",
    text: "Start bullets with a verb and finish with a result: what changed because of your work.",
  },
  {
    title: "Keep it scannable",
    text: "Short bullets, consistent dates, and a clear heading for every section help recruiters skim in seconds.",
  },
  {
    title: "Proofread twice",
    text: "Read your resume aloud, then check names, dates and contact details one more time before sending.",
  },
  {
    title: "Use a professional email",
    text: "A simple name-based address looks credible. Avoid nicknames and old school addresses.",
  },
  {
    title: "Name the file well",
    text: "Save as Firstname_Lastname_Resume so recruiters can find it among dozens of downloads.",
  },
  {
    title: "Quantify when you can",
    text: "Team sizes, percentages, amounts and timeframes make achievements believable.",
  },
  {
    title: "Put the best first",
    text: "Order sections and bullets by relevance to the job, not by habit.",
  },
  {
    title: "Link your work",
    text: "A LinkedIn, GitHub or portfolio link lets a recruiter see proof in one click.",
  },
  {
    title: "Explain gaps briefly",
    text: "A single honest line about a gap, followed by what you learned or built, beats silence.",
  },
  {
    title: "Follow up politely",
    text: "A short message a week after applying keeps your name in front of the hiring team.",
  },
  {
    title: "Keep a master version",
    text: "Save one long resume and trim a copy for each role instead of rewriting from scratch.",
  },
];

export const APPLICATION_STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  date: string;
}
