# Student Life Organizer

A personal organizer for student life: daily tasks, courses, assignments, exams and routines in one place.

**Live app:** https://utkuguldali1.github.io/MyLife/

## Features

- **Dashboard:** today's overview with overdue items and upcoming exams
- **Daily Life:** tasks with priorities, categories, checklists and postpone options
- **Academic:** courses with lecture times and links, plus assignments, exams and presentations
- **Routines:** repeating tasks (weekdays, every N days, monthly)
- **Calendar:** month and week views across all modules
- **Settings:** dark mode, JSON backup export/import, sample data

All data is stored in your browser (localStorage). There are no accounts and no server.

## Tech

React, Vite, Tailwind CSS, React Router, Zustand, date-fns, lucide-react, Vitest.

## Run locally

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
npm test         # run the tests
npm run build    # build for production into dist/
```

Every push to `main` is tested, built and deployed to GitHub Pages automatically (see `.github/workflows/deploy.yml`).
