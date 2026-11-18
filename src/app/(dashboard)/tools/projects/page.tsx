"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  estimate?: string;
};

const COLUMNS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Complete NEXORA research", status: "todo", estimate: "2h" },
    { id: "2", title: "Design AI chat interface", status: "in-progress", estimate: "4h" },
    { id: "3", title: "DEPLOY.md updates", status: "todo", estimate: "1h" },
  ]);
  const [newTask, setNewTask] = useState("");

  function moveTask(id: string, direction: "left" | "right") {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const current = tasks[idx];
    const nextIdx = direction === "left" ? idx - 1 : idx + 1;

    if (nextIdx < 0 || nextIdx >= tasks.length) return;

    const newTasks = [...tasks];
    newTasks[idx] = current;
    newTasks[nextIdx] = { ...tasks[nextIdx], status: current.status };
    setTasks(newTasks);
  }

  function updateStatus(id: string, status: Task["status"]) {
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function setNewTaskTitle(id: string, title: string) {
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, title } : task)));
  }

  function addTask() {
    if (!newTask.trim()) return;
    const id = String(tasks.length + 1);
    setTasks((t) => [...t, { id, title: newTask, status: "todo" }]);
    setNewTask("");
  }

  function deleteTask(id: string) {
    setTasks((t) => t.filter((task) => task.id !== id));
  }

  return (
    <AppShell title="Projects">
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Kanban Board
          </h2>
          <button
            onClick={addTask}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
          >
            + Add Task
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {Object.entries(COLUMNS).map(([status, label]) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="font-medium">{label}</h3>
                <span className="text-xs text-muted-foreground">
                  ({tasks.filter((t) => t.status === status).length})
                </span>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.status === status).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-border/60 bg-card/50 p-3 group"
                  >
                    <textarea
                      value={task.title}
                      onChange={(e) => setNewTaskTitle(task.id, e.target.value)}
                      className="w-full bg-transparent text-sm resize-none outline-none focus:ring-2 focus:ring-primary/25 rounded min-h-[60px] p-1"
                      placeholder="Add a task..."
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => moveTask(task.id, "left")}
                        disabled={status === "todo"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === "todo"
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>

                      <button
                        onClick={() => updateStatus(task.id, "done")}
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === "done"
                            ? "bg-primary/10"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
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

                      <button
                        onClick={() => moveTask(task.id, "right")}
                        disabled={status === "done"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === "done"
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}