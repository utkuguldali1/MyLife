import { addDaysISO, todayISO } from '../lib/dates'
import { createId } from '../lib/ids'
import { firstOccurrenceOnOrAfter } from '../lib/routines'
import { ACADEMIC_CATEGORY_ID, createDefaultData } from './defaultData'

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

  const course = (fields) => ({
    id: createId(),
    code: '',
    instructor: '',
    notes: '',
    archived: false,
    lectures: [],
    links: [],
    createdAt: now,
    updatedAt: now,
    ...fields,
  })
  const lecture = (weekday, start, end, label = '') => ({ id: createId(), weekday, start, end, label })
  const link = (label, url) => ({ id: createId(), label, url })

  const algebra = course({
    name: 'Linear Algebra',
    code: 'MA 1101',
    instructor: 'Prof. Weber',
    color: 'indigo',
    lectures: [lecture(1, '10:15', '11:45'), lecture(4, '10:15', '11:45'), lecture(3, '14:15', '15:45', 'Tutorial')],
    links: [link('Moodle', 'https://moodle.example.edu/course/view.php?id=1101'), link('Exercise sheets', 'https://example.edu/la/sheets')],
  })
  const programming = course({
    name: 'Introduction to Programming',
    code: 'IN 0001',
    instructor: 'Dr. Schmidt',
    color: 'teal',
    lectures: [lecture(2, '08:15', '09:45'), lecture(5, '12:15', '13:45', 'Lab')],
    links: [link('Moodle', 'https://moodle.example.edu/course/view.php?id=1')],
  })
  const writing = course({
    name: 'Academic Writing',
    instructor: 'Ms. Fischer',
    color: 'fuchsia',
    lectures: [lecture(3, '16:00', '17:30', 'Seminar')],
    notes: 'Bring a printed draft to every seminar.',
  })
  const routine = (fields) => ({
    id: createId(),
    categoryId: null,
    priority: 'medium',
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...fields,
  })
  const uniTask = (fields) => task({ categoryId: ACADEMIC_CATEGORY_ID, ...fields })
  const event = (fields) => ({
    id: createId(),
    startTime: null,
    endTime: null,
    location: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...fields,
  })

  return {
    ...createDefaultData(),
    courses: [algebra, programming, writing],
    routines: [
      routine({ title: 'Water the plants', categoryId: 'personal', priority: 'low', schedule: { type: 'interval', every: 3, unit: 'day' }, nextDue: today }),
      routine({ title: 'Change the bed sheets', categoryId: 'laundry', schedule: { type: 'interval', every: 2, unit: 'week' }, nextDue: day(-2) }),
      routine({ title: 'Take out the trash', categoryId: 'cleaning', schedule: { type: 'weekly', weekdays: [1, 4] }, nextDue: firstOccurrenceOnOrAfter({ type: 'weekly', weekdays: [1, 4] }, day(1)) }),
      routine({ title: 'Pay rent', categoryId: 'errands', priority: 'high', schedule: { type: 'monthly', day: 1 }, nextDue: firstOccurrenceOnOrAfter({ type: 'monthly', day: 1 }, day(1)) }),
      routine({ title: 'Weekly grocery run', categoryId: 'shopping', schedule: { type: 'weekly', weekdays: [6] }, nextDue: firstOccurrenceOnOrAfter({ type: 'weekly', weekdays: [6] }, day(1)) }),
    ],
    events: [
      event({ title: 'Linear Algebra midterm', typeId: 'exam', courseId: algebra.id, date: day(9), startTime: '10:00', endTime: '12:00', location: 'Audimax' }),
      event({ title: 'Essay presentation', typeId: 'presentation', courseId: writing.id, date: day(4), startTime: '16:00', endTime: '16:20' }),
      event({ title: 'Programming final exam', typeId: 'exam', courseId: programming.id, date: day(30), startTime: '09:00', endTime: '11:00' }),
      event({ title: 'Programming practice test', typeId: 'exam', courseId: programming.id, date: day(-6), startTime: '08:15', endTime: '08:45' }),
    ],
    tasks: [
      uniTask({ title: 'Exercise sheet 4', courseId: algebra.id, typeId: 'homework', dueDate: day(-1), priority: 'high' }),
      uniTask({ title: 'Exercise sheet 5', courseId: algebra.id, typeId: 'homework', dueDate: day(6) }),
      uniTask({
        title: 'Coding assignment: sorting algorithms',
        courseId: programming.id,
        typeId: 'assignment',
        dueDate: day(1),
        priority: 'high',
        checklist: [item('Bubble sort', true), item('Merge sort'), item('Write tests')],
      }),
      uniTask({ title: 'Group project: to-do app', courseId: programming.id, typeId: 'project', dueDate: day(21), priority: 'low' }),
      uniTask({ title: 'Draft essay outline', courseId: writing.id, typeId: 'assignment', dueDate: day(3) }),
      uniTask({ title: 'Read chapter 3', courseId: writing.id, typeId: 'homework', status: 'done', completedAt: now }),
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
