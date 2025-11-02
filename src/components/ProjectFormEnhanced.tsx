"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/Store";
import { Spinner } from "@/components/ui/spinner";

export function ProjectFormEnhanced() {
    const { members, createProject, loading } = useStore();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", description: "" });
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    function toggleMember(id: string) {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name) return alert("Nombre requerido");
        await createProject({ title: form.name, description: form.description, members: selectedMembers, progress: 0, status: "Activo", team: selectedMembers.length });
        setForm({ name: "", description: "" });
        setSelectedMembers([]);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nuevo Proyecto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                    <DialogDescription>Agregar miembros del equipo al proyecto.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
                    <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border px-3 py-2 rounded" />

                    <div>
                        <p className="font-medium mb-2">Seleccionar miembros</p>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                            {members.map(m => (
                                <label key={m.userId} className="flex items-center gap-2">
                                    <input type="checkbox" checked={selectedMembers.includes(m.userId)} onChange={() => toggleMember(m.userId)} />
                                    <span>{m.name} ({m.role})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit">{loading ? <Spinner /> : "Crear"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
