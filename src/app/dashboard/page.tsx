"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogTrigger,
  DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/context/Store";

/**
 * Dashboard consolidado:
 * - Resumen (Overview)
 * - Proyectos (CRUD + progreso)
 * - Equipo (CRUD)
 * - Tareas (CRUD + paginación + calendario)
 * - Configuración (simulada)
 */

export default function DashboardPage() {
  const store = useStore();
  const { projects, members, tasks, settings, loading } = store;

  const [tab, setTab] = useState("overview");

  // ───────────────────────────────
  // PROJECTS
  // ───────────────────────────────
  const [pOpen, setPOpen] = useState(false);
  const [pForm, setPForm] = useState({
    title: "",
    description: "",
    members: [] as string[],
  });

  function togglePMember(id: string) {
    setPForm((f) =>
      f.members.includes(id)
        ? { ...f, members: f.members.filter((x) => x !== id) }
        : { ...f, members: [...f.members, id] }
    );
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!pForm.title.trim()) return alert("Nombre del proyecto requerido");
    await store.createProject({
      title: pForm.title,
      description: pForm.description,
      members: pForm.members,
      progress: 0,
      status: "Activo",
      team: pForm.members.length,
    });
    setPForm({ title: "", description: "", members: [] });
    setPOpen(false);
  }

  // ───────────────────────────────
  // MEMBERS
  // ───────────────────────────────
  const [mOpen, setMOpen] = useState(false);
  const [mEditing, setMEditing] = useState<string | null>(null);
  const emptyMember = {
    userId: crypto.randomUUID(),
    role: "",
    name: "",
    email: "",
    position: "",
    birthdate: "",
    phone: "",
    projectId: undefined as string | undefined,
    isActive: true,
  };
  const [mForm, setMForm] = useState<any>(emptyMember);

  function startCreateMember() {
    setMEditing(null);
    setMForm({ ...emptyMember, userId: crypto.randomUUID() });
    setMOpen(true);
  }

  function startEditMember(userId: string) {
    const m = members.find((x) => x.userId === userId);
    if (!m) return;
    setMEditing(userId);
    setMForm({ ...m });
    setMOpen(true);
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();
    if (!mForm.name || !mForm.email)
      return alert("Nombre y email son requeridos");
    if (mEditing) await store.updateMember(mEditing, mForm);
    else await store.createMember(mForm);
    setMOpen(false);
  }

  // ───────────────────────────────
  // TASKS
  // ───────────────────────────────
  const [tOpen, setTOpen] = useState(false);
  const [tEditing, setTEditing] = useState<string | null>(null);
  const emptyTask = {
    description: "",
    projectId: projects[0]?.id ?? "",
    status: "Pendiente",
    priority: "Media",
    userId: undefined as string | undefined,
    dateline: undefined as string | undefined,
  };
  const [tForm, setTForm] = useState<any>(emptyTask);

  function startCreateTask() {
    setTEditing(null);
    setTForm({ ...emptyTask, projectId: projects[0]?.id ?? "" });
    setTOpen(true);
  }

  function startEditTask(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setTEditing(id);
    setTForm({ ...t });
    setTOpen(true);
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!tForm.description) return alert("Descripción requerida");
    if (tEditing) await store.updateTask(tEditing, tForm);
    else await store.createTask(tForm);
    setTOpen(false);
  }

  // ───────────────────────────────
  // SETTINGS
  // ───────────────────────────────
  const [localSettings, setLocalSettings] = useState(settings);
  async function saveSettings() {
    await store.updateSettings(localSettings);
    alert("Configuración guardada");
  }

  // ───────────────────────────────
  // HELPERS
  // ───────────────────────────────
  function confirmAndDeleteProject(id: string) {
    if (confirm("¿Eliminar proyecto? Esto quitará sus tareas."))
      store.deleteProject(id);
  }
  function confirmAndDeleteMember(userId: string) {
    if (confirm("¿Eliminar miembro? Sus tareas quedarán sin asignar."))
      store.deleteMember(userId);
  }
  function confirmAndDeleteTask(id: string) {
    if (confirm("¿Eliminar tarea?")) store.deleteTask(id);
  }

  const [page, setPage] = useState(1);
  const per = settings.itemsPerPage ?? 5;
  const totalPages = Math.max(1, Math.ceil(tasks.length / per));
  const pageItems = tasks.slice((page - 1) * per, page * per);

  // ───────────────────────────────
  // MÉTRICAS Y ESTADÍSTICAS
  // ───────────────────────────────
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completado").length;
  const activeMembers = members.filter((m) => m.isActive).length;
  const avgProgress = projects.length
    ? Math.round(
        projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard de Proyectos
          </h1>
          <p className="text-slate-600">
            Gestiona tus proyectos, equipo y tareas con Shadcn/UI
          </p>
        </div>

        <Tabs defaultValue={tab} value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="team">Equipo</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* ─────────── Overview ─────────── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Total Proyectos", value: totalProjects, desc: "+2 desde el mes pasado" },
                { title: "Tareas Completadas", value: completedTasks, desc: "+19% desde la semana pasada" },
                { title: "Miembros Activos", value: activeMembers, desc: "+1 nuevo miembro" },
                { title: "Progreso Promedio", value: `${avgProgress}%`, desc: "Basado en todos los proyectos" },
              ].map((stat, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actividad reciente */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas tareas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{(t.description || "T")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{t.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.status} • {t.priority} • {t.dateline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─────────── Projects ─────────── */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Proyectos</h2>
              <Dialog open={pOpen} onOpenChange={setPOpen}>
                <DialogTrigger asChild>
                  <Button>Nuevo Proyecto</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Proyecto</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="grid gap-3 py-2">
                    <input
                      className="border px-2 py-1 rounded"
                      placeholder="Nombre"
                      value={pForm.title}
                      onChange={(e) =>
                        setPForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                    <textarea
                      className="border px-2 py-1 rounded"
                      placeholder="Descripción"
                      value={pForm.description}
                      onChange={(e) =>
                        setPForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                    <div>
                      <div className="font-medium mb-1">Seleccionar miembros</div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                        {members.map((m) => (
                          <label key={m.userId} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pForm.members.includes(m.userId)}
                              onChange={() => togglePMember(m.userId)}
                            />
                            <span>
                              {m.name} ({m.role})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setPOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">{loading ? <Spinner /> : "Crear"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <CardTitle className="text-lg">{p.title}</CardTitle>
                        <CardDescription>{p.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{p.status || "Activo"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {p.team || p.members.length} miembros
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => confirmAndDeleteProject(p.id)}>
                          {loading ? <Spinner /> : "Eliminar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─────────── Team ─────────── */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Equipo</h2>
              <Button onClick={startCreateMember}>Nuevo Miembro</Button>
            </div>

            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between p-3 bg-card rounded"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {m.name.split(" ").map((s: any) => s[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {m.name}{" "}
                      <span className="text-sm text-muted-foreground">
                        ({m.role})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.email} • {m.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startEditMember(m.userId)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmAndDeleteMember(m.userId)}
                  >
                    {loading ? <Spinner /> : "Eliminar"}
                  </Button>
                </div>
              </div>
            ))}

            <Dialog open={mOpen} onOpenChange={setMOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {mEditing ? "Editar Miembro" : "Crear Miembro"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={saveMember} className="grid gap-2">
                  <input
                    className="border px-2 py-1 rounded"
                    placeholder="Nombre"
                    value={mForm.name}
                    onChange={(e) =>
                      setMForm((f: any) => ({ ...f, name: e.target.value }))
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded"
                    placeholder="Email"
                    value={mForm.email}
                    onChange={(e) =>
                      setMForm((f: any) => ({ ...f, email: e.target.value }))
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded"
                    placeholder="Rol"
                    value={mForm.role}
                    onChange={(e) =>
                      setMForm((f: any) => ({ ...f, role: e.target.value }))
                    }
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{loading ? <Spinner /> : "Guardar"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ─────────── Tasks ─────────── */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tareas</h2>
              <Button onClick={startCreateTask}>Nueva Tarea</Button>
            </div>

            {pageItems.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-card rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{t.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.status} • {t.priority} • {t.dateline}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startEditTask(t.id)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmAndDeleteTask(t.id)}
                  >
                    {loading ? <Spinner /> : "Eliminar"}
                  </Button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    page === i + 1 ? "font-bold bg-primary/20" : "bg-transparent"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>

            {/* Task Dialog */}
            <Dialog open={tOpen} onOpenChange={setTOpen}>
              <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                  <DialogTitle>
                    {tEditing ? "Editar Tarea" : "Crear Tarea"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={saveTask} className="grid gap-2">
                  <input
                    className="border px-2 py-1 rounded"
                    placeholder="Descripción"
                    value={tForm.description}
                    onChange={(e) =>
                      setTForm((f: any) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                  <select
                    className="border px-2 py-1 rounded"
                    value={tForm.projectId}
                    onChange={(e) =>
                      setTForm((f: any) => ({ ...f, projectId: e.target.value }))
                    }
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>

                  <div>
                    <p className="text-sm mb-1">Fecha límite</p>
                    <Calendar
                      mode="single"
                      selected={
                        tForm.dateline ? new Date(tForm.dateline) : undefined
                      }
                      onSelect={(d: any) =>
                        setTForm((f: any) => ({
                          ...f,
                          dateline: d?.toISOString().split("T")[0],
                        }))
                      }
                    />
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{loading ? <Spinner /> : "Guardar"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ─────────── Settings ─────────── */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Preferencias de la aplicación (simulado)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-w-xl">
                  <label className="flex items-center gap-3">
                    <span className="w-40">Tema</span>
                    <select
                      value={localSettings.theme}
                      onChange={(e) =>
                        setLocalSettings((s: any) => ({
                          ...s,
                          theme: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 rounded"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-3">
                    <span className="w-40">Items por página</span>
                    <input
                      type="number"
                      value={localSettings.itemsPerPage}
                      onChange={(e) =>
                        setLocalSettings((s: any) => ({
                          ...s,
                          itemsPerPage: Number(e.target.value),
                        }))
                      }
                      className="border px-2 py-1 rounded w-24"
                    />
                  </label>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLocalSettings(settings)}
                    >
                      Reset
                    </Button>
                    <Button onClick={saveSettings}>
                      {loading ? <Spinner /> : "Guardar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
