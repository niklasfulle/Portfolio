import { getCachedGithubStats } from "@/lib/github-stats-cache";
import PortfolioSections from "@/components/PortfolioSections";
import {
  getAbout,
  getContactEmail,
  getExperience,
  getProjects,
  getSkills,
} from "@/lib/db/functions";
import type { SkillType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [abouteMe, projects, skills, experience, contactEmail, githubStats] =
    await Promise.all([
      getAbout(),
      getProjects(),
      getSkills(),
      getExperience(),
      getContactEmail(),
      getCachedGithubStats(),
    ]);
  const recipientEmail = contactEmail[0]?.email ?? "name@beispiel.de";
  const skillsData = skills.map((skill: SkillType) => skill.name);

  return (
    <PortfolioSections
      aboutMe={abouteMe}
      projects={projects}
      skills={skillsData}
      experience={experience}
      contactEmail={recipientEmail}
      githubStats={githubStats}
    />
  );
}
