import { addDaysISO, todayISO } from '../lib/dates'
import { createId } from '../lib/ids'
import { createDefaultData } from './defaultData'

// Example data so you can try the app without typing everything in.
// Dates are relative to today, so the sample always looks "fresh".
export function createSampleData() {
  const today = todayISO()
  const now = new Date().toISOString()
  const day = (offset) => addDaysISO(today, offset)

  const task = (fields) => ({
    id: createId(),
    notes: '',
    priority: 'medium',
    status: 'todo',
    completedAt: null,
    checklist: [],
    courseId: null,
    typeId: null,
    createdAt: now,
    updatedAt: now,
    ...fields,
  })
  const item = (text, done = false) => ({ id: createId(), text, done })

  return {
    ...createDefaultData(),
    tasks: [
      task({ title: 'Do the laundry', categoryId: 'laundry', dueDate: day(-1) }),
      task({
        title: 'Grocery shopping',
        categoryId: 'shopping',
        dueDate: today,
        priority: 'high',
        checklist: [
          item('Milk', true),
          item('Eggs'),
          item('Bread'),
          item('Pasta'),
          item('Tomatoes'),
        ],
      }),
      task({ title: 'Clean the bathroom', categoryId: 'cleaning', dueDate: day(2) }),
      task({
        title: 'Pick up package at the post office',
        categoryId: 'errands',
        dueDate: day(1),
        priority: 'low',
      }),
      task({ title: 'Call home', categoryId: 'personal', priority: 'low' }),
      task({
        title: 'Vacuum the floors',
        categoryId: 'cleaning',
        dueDate: day(-1),
        status: 'done',
        completedAt: now,
      }),
    ],
  }
}
