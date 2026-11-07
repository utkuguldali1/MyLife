import { createId } from '../../lib/ids'

// Small helper: apply `change` to the task with this id, leave others alone.
function updateTaskIn(tasks, id, change) {
  return tasks.map((t) =>
    t.id === id ? { ...t, ...change(t), updatedAt: new Date().toISOString() } : t,
  )
}

// Actions for tasks (add, edit, complete, postpone, checklists…)
export function createTaskSlice(set) {
  return {
    addTask(input) {
      const now = new Date().toISOString()
      const task = {
        id: createId(),
        title: input.title.trim(),
        notes: input.notes ?? '',
        categoryId: input.categoryId ?? null,
        dueDate: input.dueDate || null,
        priority: input.priority ?? 'medium',
        status: 'todo',
        completedAt: null,
        checklist: input.checklist ?? [],
        courseId: input.courseId ?? null, // used by academic tasks (Step 4)
        typeId: input.typeId ?? null, // e.g. "assignment" (Step 4)
        createdAt: now,
        updatedAt: now,
      }
      set((state) => ({ tasks: [...state.tasks, task] }))
      return task
    },

    updateTask(id, changes) {
      set((state) => ({ tasks: updateTaskIn(state.tasks, id, () => changes) }))
    },

    deleteTask(id) {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    },

    deleteCompletedTasks(taskIds) {
      const ids = new Set(taskIds)
      set((state) => ({ tasks: state.tasks.filter((t) => !ids.has(t.id)) }))
    },

    toggleTaskDone(id) {
      set((state) => ({
        tasks: updateTaskIn(state.tasks, id, (t) =>
          t.status === 'done'
            ? { status: 'todo', completedAt: null }
            : { status: 'done', completedAt: new Date().toISOString() },
        ),
      }))
    },

    postponeTask(id, newDate) {
      set((state) => ({ tasks: updateTaskIn(state.tasks, id, () => ({ dueDate: newDate })) }))
    },

    // ── Checklist items inside a task ──
    addChecklistItem(taskId, text) {
      const item = { id: createId(), text: text.trim(), done: false }
      set((state) => ({
        tasks: updateTaskIn(state.tasks, taskId, (t) => ({ checklist: [...t.checklist, item] })),
      }))
    },

    toggleChecklistItem(taskId, itemId) {
      set((state) => ({
        tasks: updateTaskIn(state.tasks, taskId, (t) => ({
          checklist: t.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
        })),
      }))
    },

    updateChecklistItem(taskId, itemId, text) {
      set((state) => ({
        tasks: updateTaskIn(state.tasks, taskId, (t) => ({
          checklist: t.checklist.map((i) => (i.id === itemId ? { ...i, text } : i)),
        })),
      }))
    },

    deleteChecklistItem(taskId, itemId) {
      set((state) => ({
        tasks: updateTaskIn(state.tasks, taskId, (t) => ({
          checklist: t.checklist.filter((i) => i.id !== itemId),
        })),
      }))
    },
  }
}
