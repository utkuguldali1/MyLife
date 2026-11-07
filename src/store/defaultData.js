// What the app's data looks like on first start (or after "Clear all data").
// Bump DATA_VERSION if the shape of the data ever changes in a way that
// needs old saved data to be converted.
export const DATA_VERSION = 1

// The Academic category is special: the Academic planner uses it,
// so it can be renamed and recolored but not deleted.
export const ACADEMIC_CATEGORY_ID = 'academic'

const DEFAULT_CATEGORIES = [
  { id: ACADEMIC_CATEGORY_ID, name: 'Academic', color: 'blue', locked: true },
  { id: 'cleaning', name: 'Cleaning', color: 'cyan' },
  { id: 'laundry', name: 'Laundry', color: 'violet' },
  { id: 'shopping', name: 'Shopping', color: 'pink' },
  { id: 'errands', name: 'Errands', color: 'orange' },
  { id: 'personal', name: 'Personal', color: 'slate' },
]

// Types of academic items. "task" types are things you complete (homework),
// "event" types are things that happen at a time (exams). Editable later.
const DEFAULT_ACADEMIC_TYPES = [
  { id: 'assignment', name: 'Assignment', kind: 'task' },
  { id: 'homework', name: 'Homework', kind: 'task' },
  { id: 'project', name: 'Project', kind: 'task' },
  { id: 'exam', name: 'Exam', kind: 'event' },
  { id: 'presentation', name: 'Presentation', kind: 'event' },
]

export function createDefaultData() {
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    academicTypes: DEFAULT_ACADEMIC_TYPES.map((t) => ({ ...t })),
    tasks: [], // one-off to-dos (household, personal and academic)
    courses: [], // university courses (Step 4)
    events: [], // exams, presentations (Step 4)
    routines: [], // recurring tasks (Step 5)
    completionLog: [], // history of completed routines (Step 5, future statistics)
  }
}

// The names of all the data lists — used for saving, backup and reset.
export const DATA_KEYS = Object.keys(createDefaultData())
