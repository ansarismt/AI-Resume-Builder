import "./ResumeDocument.css";
import { getTemplateMeta } from "./templateCatalog";
import type { ResumeData } from "./types";
import { SECTION_SETS, type SectionDef, type SectionKey } from "./sections";
import { splitSkills } from "./resumeUtils";
import type { CSSProperties } from "react";

// Sections that move into the side column on sidebar and split layouts.
const ASIDE_KEYS: SectionKey[] = ["skills", "education", "certifications"];

function contactItems(data: ResumeData): string[] {
  const links = data.links ?? {};
  return [data.email, data.phone, data.location, links.linkedin, links.github, links.portfolio]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
}

function Section({ def, text }: { def: SectionDef; text: string }) {
  const value = text.trim();
  const filled = value.length > 0;
  const skills = def.key === "skills" && filled ? splitSkills(value) : null;

  return (
    <section className={`rd__section${filled ? "" : " rd__section--empty"}`}>
      <h2 className="rd__heading">{def.title}</h2>
      {skills ? (
        <ul className="rd__skills">
          {skills.map((skill, index) => (
            <li key={`${skill}-${index}`}>{skill}</li>
          ))}
        </ul>
      ) : (
        <div className={`rd__body${filled ? "" : " rd__placeholder"}`}>
          {filled ? value : def.placeholder}
        </div>
      )}
    </section>
  );
}

function Contact({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <ul className="rd__contact">
        <li className="rd__placeholder">you@email.com</li>
      </ul>
    );
  }
  return (
    <ul className="rd__contact">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function getReadableTextColor(color: string) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150 ? "#111827" : "#ffffff";
}

export function ResumeDocument({ data, accentColor }: { data: ResumeData; accentColor?: string }) {
  const meta = getTemplateMeta(data.template);
  const sections = SECTION_SETS[data.user_type] ?? SECTION_SETS.college;
  const contact = contactItems(data);
  const headline = (data.headline ?? "").trim();
  const style = accentColor
    ? ({
        "--accent": accentColor,
        "--primary": accentColor,
        "--ink": "#172033",
        "--paper": "#ffffff",
        "--rule": "#d8dee8",
        "--resume-primary": accentColor,
        "--resume-primary-foreground": getReadableTextColor(accentColor),
        "--resume-soft": `${accentColor}18`,
      } as CSSProperties)
    : undefined;

  const isSidebar = meta.layout === "sidebar-left" || meta.layout === "sidebar-right";
  const isSplit = meta.layout === "split";
  const hasAside = isSidebar || isSplit;

  const asideSections = hasAside ? sections.filter((s) => ASIDE_KEYS.includes(s.key)) : [];
  const mainSections = hasAside ? sections.filter((s) => !ASIDE_KEYS.includes(s.key)) : sections;

  const renderSections = (list: SectionDef[]) =>
    list.map((def) => <Section key={def.key} def={def} text={data[def.key] ?? ""} />);

  const identity = (
    <div className="rd__identity">
      <h1 className="rd__name">{data.name?.trim() || "Your Name"}</h1>
      {headline && <p className="rd__headline">{headline}</p>}
    </div>
  );

  let body;
  if (isSidebar) {
    body = (
      <div className="rd__frame">
        <aside className="rd__aside">
          <Contact items={contact} />
          {renderSections(asideSections)}
        </aside>
        <div className="rd__main">
          <header className="rd__header">{identity}</header>
          {renderSections(mainSections)}
        </div>
      </div>
    );
  } else if (isSplit) {
    body = (
      <>
        <header className="rd__header">
          {identity}
          <Contact items={contact} />
        </header>
        <div className="rd__cols">
          <div className="rd__main">{renderSections(mainSections)}</div>
          <aside className="rd__aside">{renderSections(asideSections)}</aside>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <header className="rd__header">
          {identity}
          <Contact items={contact} />
        </header>
        <div className="rd__main">{renderSections(mainSections)}</div>
      </>
    );
  }

  return (
    <div className="rd-wrap" style={style}>
      <article className={`rd rd--${meta.layout} rd--${meta.font}`}>{body}</article>
    </div>
  );
}
