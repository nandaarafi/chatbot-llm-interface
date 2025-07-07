"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function ToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Optionally render a placeholder or nothing until mounted
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="rounded-full p-2 transition-colors bg-transparent hover:bg-muted"
        disabled
      >
        <Moon size={20} strokeWidth={2} />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 transition-colors bg-transparent hover:bg-muted"
    >
      {isDark ? (
        <Sun size={20} strokeWidth={2} />
      ) : (
        <Moon size={20} strokeWidth={2} />
      )}
    </button>
  )
}