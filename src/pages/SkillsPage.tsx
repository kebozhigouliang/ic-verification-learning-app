import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { projects } from "@/data/projects";
import { learningRoadmap } from "@/data/roadmap";
import { skills } from "@/data/skills";
import { weeks } from "@/data/weeks";
import type { LearningProgress } from "@/types/progress";
import { calculateSkillProgress } from "@/utils/skillProgress";

interface SkillsPageProps {
  progress: LearningProgress;
}

export function SkillsPage({ progress }: SkillsPageProps) {
  return (
    <AppShell activePage="skills">
      <PageIntro
        code="SKILLS / CALCULATED"
        title="技能树"
        description="技能进度由 Roadmap 任务、项目和 Mastery 状态实时计算。"
      />

      <section className="skills-list" aria-label="IC Verification skills">
        {skills.map((skill) => {
          const skillProgress = calculateSkillProgress(skill, {
            learningProgress: progress,
            projects,
            roadmap: learningRoadmap,
            weeks,
          });
          const relatedProjects = projects.filter((project) => (
            skill.relatedProjectIds.includes(project.id)
          ));

          return (
            <article className="skill-card" key={skill.id}>
              <header>
                <div>
                  <span>{skill.category.toUpperCase()}</span>
                  <h2>{skill.name}</h2>
                </div>
                <strong>{skillProgress.completion}%</strong>
              </header>

              <div
                aria-label={`${skill.name} ${skillProgress.completion}% complete`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={skillProgress.completion}
                className="skill-progress-track"
                role="progressbar"
              >
                <span style={{ width: `${skillProgress.completion}%` }} />
              </div>

              <div className="skill-projects">
                <span>RELATED PROJECTS</span>
                {relatedProjects.length > 0 ? (
                  <ul>
                    {relatedProjects.map((project) => (
                      <li key={project.id}>{project.title}</li>
                    ))}
                  </ul>
                ) : <p>NO LINKED PROJECTS</p>}
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
