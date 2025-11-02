"use client";

import React, { createContext, useContext, useState } from "react";

export type Project = {
  id: string;
  title: string;
  description?: string;
  members: string[]; // userIds
  progress?: number;
  status: string; // ← nuevo campo
  team: number;   // ← nuevo campo (número de miembros)
};

export type Member = {
  userId: string;
  role: string;
  name: string;
  email: string;
  position?: string;
  birthdate?: string; // ISO
  phone?: string;
  projectId?: string;
  isActive: boolean;
};

export type Task = {
  id: string;
  description: string;
  projectId: string;
  status: "Pendiente" | "En progreso" | "Completado";
  priority: "Baja" | "Media" | "Alta" | "Urgente";
  userId?: string;
  dateline?: string; // ISO date
};

export type Settings = {
  theme: "light" | "dark";
  itemsPerPage: number;
  notifications: boolean;
};

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

type StoreContextType = {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  settings: Settings;
  loading: boolean;
  // projects
  createProject: (p: Omit<Project, "id">) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  // members
  createMember: (m: Member) => Promise<void>;
  updateMember: (userId: string, patch: Partial<Member>) => Promise<void>;
  deleteMember: (userId: string) => Promise<void>;
  // tasks
  createTask: (t: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // settings
  updateSettings: (s: Partial<Settings>) => Promise<void>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  // --------------------------
  // 📁 Initial Data
  // --------------------------
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "p1",
      title: "E-commerce Platform",
      description: "Plataforma de comercio electrónico con Next.js",
      members: ["u1", "u2"],
      progress: 65,
      status: "En progreso",
      team: 5,
    },
    {
      id: "p2",
      title: "Mobile App",
      description: "Aplicación móvil con React Native",
      members: ["u3"],
      progress: 90,
      status: "En revisión",
      team: 3,
    },
    {
      id: "p3",
      title: "Dashboard Analytics",
      description: "Panel de análisis con visualizaciones",
      members: ["u1"],
      progress: 20,
      status: "Planificado",
      team: 4,
    },
  ]);

  const [members, setMembers] = useState<Member[]>([
    {
      userId: "u1",
      role: "Frontend",
      name: "María García",
      email: "maria@example.com",
      position: "Frontend Dev",
      birthdate: "1990-05-12",
      phone: "999111222",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "u2",
      role: "Backend",
      name: "Juan Pérez",
      email: "juan@example.com",
      position: "Backend Dev",
      birthdate: "1988-02-10",
      phone: "999333444",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "u3",
      role: "Designer",
      name: "Ana López",
      email: "ana@example.com",
      position: "UI/UX",
      birthdate: "1992-07-01",
      phone: "999555666",
      projectId: "p2",
      isActive: false,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      description: "Implementar autenticación",
      projectId: "p1",
      status: "En progreso",
      priority: "Alta",
      userId: "u2",
      dateline: "2025-11-15",
    },
    {
      id: "t2",
      description: "Diseñar pantalla de perfil",
      projectId: "p2",
      status: "Pendiente",
      priority: "Media",
      userId: "u3",
      dateline: "2025-11-20",
    },
  ]);

  const [settings, setSettings] = useState<Settings>({
    theme: "light",
    itemsPerPage: 5,
    notifications: true,
  });

  // --------------------------
  // 🧩 Projects CRUD
  // --------------------------
  async function createProject(p: Omit<Project, "id">) {
    setLoading(true);
    await delay();
    const id = crypto.randomUUID();
    setProjects((prev) => [{ id, ...p }, ...prev]);
    setLoading(false);
  }

  async function updateProject(id: string, patch: Partial<Project>) {
    setLoading(true);
    await delay();
    setProjects((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
    );
    setLoading(false);
  }

  async function deleteProject(id: string) {
    setLoading(true);
    await delay();
    setProjects((prev) => prev.filter((x) => x.id !== id));
    // detach members/tasks
    setMembers((prev) =>
      prev.map((m) => (m.projectId === id ? { ...m, projectId: undefined } : m))
    );
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    setLoading(false);
  }

  // --------------------------
  // 👥 Members CRUD
  // --------------------------
  async function createMember(m: Member) {
    setLoading(true);
    await delay();
    setMembers((prev) => [m, ...prev]);
    setLoading(false);
  }

  async function updateMember(userId: string, patch: Partial<Member>) {
    setLoading(true);
    await delay();
    setMembers((prev) =>
      prev.map((x) => (x.userId === userId ? { ...x, ...patch } : x))
    );
    setLoading(false);
  }

  async function deleteMember(userId: string) {
    setLoading(true);
    await delay();
    setMembers((prev) => prev.filter((x) => x.userId !== userId));
    setTasks((prev) =>
      prev.map((t) => (t.userId === userId ? { ...t, userId: undefined } : t))
    );
    setLoading(false);
  }

  // --------------------------
  // ✅ Tasks CRUD
  // --------------------------
  async function createTask(t: Omit<Task, "id">) {
    setLoading(true);
    await delay();
    setTasks((prev) => [{ id: crypto.randomUUID(), ...t }, ...prev]);
    setLoading(false);
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    setLoading(true);
    await delay();
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
    );
    setLoading(false);
  }

  async function deleteTask(id: string) {
    setLoading(true);
    await delay();
    setTasks((prev) => prev.filter((x) => x.id !== id));
    setLoading(false);
  }

  // --------------------------
  // ⚙️ Settings
  // --------------------------
  async function updateSettings(s: Partial<Settings>) {
    setLoading(true);
    await delay();
    setSettings((prev) => ({ ...prev, ...s }));
    setLoading(false);
  }

  const value: StoreContextType = {
    projects,
    members,
    tasks,
    settings,
    loading,
    createProject,
    updateProject,
    deleteProject,
    createMember,
    updateMember,
    deleteMember,
    createTask,
    updateTask,
    deleteTask,
    updateSettings,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
