// The small logo + app name shown at the top of the sidebar and mobile header.
export default function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
        S
      </div>
      <span className="text-sm font-semibold tracking-tight">Student Life</span>
    </div>
  )
}
