"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function ResumePage() {
  const [showEditor, setShowEditor] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [title, setTitle] = useState("Software Engineer");
  const [experience, setExperience] = useState([
    { id: "1", company: "Example Inc", position: "Software Engineer", dates: "2022 - Present" },
    { id: "2", company: "Tech Corp", position: "Junior Developer", dates: "2020 - 2022" },
  ]);
  const [education, setEducation] = useState([
    { id: "1", school: "University of Technology", degree: "B.S. Computer Science", dates: "2016 - 2020" },
  ]);
  const [skills, setSkills] = useState([
    { id: "1", name: "JavaScript" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "React" },
  ]);

  function addExperience() {
    setExperience((e) => [
      ...e,
      { id: String(Date.now()), company: "", position: "", dates: "" },
    ]);
  }

  function updateExperience(id: string, field: string, value: string) {
    setExperience((e) => e.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  }

  function deleteExperience(id: string) {
    setExperience((e) => e.filter((ex) => ex.id !== id));
  }

  function addEducation() {
    setEducation((e) => [
      ...e,
      { id: String(Date.now()), school: "", degree: "", dates: "" },
    ]);
  }

  function updateEducation(id: string, field: string, value: string) {
    setEducation((e) => e.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  }

  function deleteEducation(id: string) {
    setEducation((e) => e.filter((edu) => edu.id !== id));
  }

  function addSkill() {
    setSkills((s) => [...s, { id: String(Date.now()), name: "" }]);
  }

  function updateSkill(id: string, value: string) {
    setSkills((s) => s.map((skill) => (skill.id === id ? { ...skill, name: value } : skill)));
  }

  function deleteSkill(id: string) {
    setSkills((s) => s.filter((skill) => skill.id !== id));
  }

  function exportResume() {
    const resume = `NAME
${fullName}
${email} | ${phone}
--------------
TITLE
${title}
--------------
EXPERIENCE
${experience
  .map(
    (ex) =>
      `${ex.position} | ${ex.company}
${ex.dates}\n`
  )
  .join("\n")}
--------------
EDUCATION
${education
  .map(
    (edu) =>
      `${edu.degree} | ${edu.school}
${edu.dates}\n`
  )
  .join("\n")}
--------------
SKILLS
${skills.map((s) => s.name).join(", ")}`;

    const blob = new Blob([resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Resume Builder">
      <div className="max-w-5xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Resume Builder
          </h2>
          <button
            onClick={exportResume}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
          >
            Export .txt
          </button>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowEditor(true)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showEditor
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 text-muted-foreground hover:border-primary/30"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setShowEditor(false)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !showEditor
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 text-muted-foreground hover:border-primary/30"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Preview Mode */}
        {!showEditor && (
          <div className="max-w-2xl mx-auto bg-white text-gray-900 p-8 rounded-2xl shadow-lg font-serif leading-relaxed border border-gray-200">
            <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-sm mt-2">{email} | {phone}</p>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Title</p>
              <p className="mt-1">{title}</p>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Experience</p>
              {experience.map((ex) => (
                <p key={ex.id} className="mt-2">
                  <span className="font-semibold">{ex.position}</span> | {ex.company}
                  <span className="text-sm ml-2">{ex.dates}</span>
                </p>
              ))}
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Education</p>
              {education.map((edu) => (
                <p key={edu.id} className="mt-2">
                  <span className="font-semibold">{edu.degree}</span> | {edu.school}
                  <span className="text-sm ml-2">{edu.dates}</span>
                </p>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Skills</p>
              <p className="mt-2">{skills.map((s) => s.name).join(", ")}</p>
            </div>
          </div>
        )}

        {/* Editor Mode */}
        {showEditor && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Contact Information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 sm:col-span-2"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Job Title
              </h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Experience
                </h3>
                <button
                  onClick={addExperience}
                  className="text-xs px-3 py-1.5 rounded-lg border border-primary/60 text-primary hover:bg-primary/10 transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {experience.map((ex) => (
                  <div
                    key={ex.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ex.position}
                        onChange={(e) => updateExperience(ex.id, "position", e.target.value)}
                        placeholder="Position"
                        className="flex-1 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                      />
                      <input
                        type="text"
                        value={ex.company}
                        onChange={(e) => updateExperience(ex.id, "company", e.target.value)}
                        placeholder="Company"
                        className="flex-1 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                      />
                    </div>
                    <input
                      type="text"
                      value={ex.dates}
                      onChange={(e) => updateExperience(ex.id, "dates", e.target.value)}
                      placeholder="Dates (e.g. 2021 - 2023)"
                      className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                    />
                    <button
                      onClick={() => deleteExperience(ex.id)}
                      className="text-destructive text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Education
                </h3>
                <button
                  onClick={addEducation}
                  className="text-xs px-3 py-1.5 rounded-lg border border-primary/60 text-primary hover:bg-primary/10 transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        placeholder="School"
                        className="flex-1 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="Degree"
                        className="flex-1 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                      />
                    </div>
                    <input
                      type="text"
                      value={edu.dates}
                      onChange={(e) => updateEducation(edu.id, "dates", e.target.value)}
                      placeholder="Dates (e.g. 2017 - 2021)"
                      className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                    />
                    <button
                      onClick={() => deleteEducation(edu.id)}
                      className="text-destructive text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Skills
                </h3>
                <button
                  onClick={addSkill}
                  className="text-xs px-3 py-1.5 rounded-lg border border-primary/60 text-primary hover:bg-primary/10 transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, e.target.value)}
                      placeholder="Skill"
                      className="rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                    />
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}