"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CircleIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

function RadioGroup({
  className,
  onKeyDownCapture,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      onKeyDownCapture={event => {
        onKeyDownCapture?.(event)
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
        if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
        const radios = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled):not([aria-disabled="true"])')).filter(item => item.closest('[role="radiogroup"]') === event.currentTarget)
        const current = radios.indexOf(event.target as HTMLButtonElement)
        if (current < 0 || !radios.length) return
        const rtl = (props.dir ?? getComputedStyle(event.currentTarget).direction) === "rtl"
        const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
        const next = event.key === "Home" ? 0 : event.key === "End" ? radios.length - 1 : current + (forward ? 1 : -1)
        if (props.loop === false && (next < 0 || next >= radios.length)) return
        event.preventDefault()
        event.stopPropagation()
        // Select explicitly: relying on the document keydown/focus ordering can
        // leave a moved radio unselected on a newly mounted group.
        const target = radios[(next + radios.length) % radios.length]
        target.focus()
        target.click()
      }}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
