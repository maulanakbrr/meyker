import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-gray-950 text-white rounded-xl border border-gray-800", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 items-center px-1",
        caption_label: "text-xs font-bold text-gray-200",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-gray-900 border-gray-800 p-0 text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.75rem]",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-indigo-600/20 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md rounded-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-xs aria-selected:opacity-100 hover:bg-gray-800 hover:text-white cursor-pointer data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium"
        ),
        day_range_start: "day-range-start bg-indigo-600 text-white font-bold rounded-l-md shadow-md",
        day_range_end: "day-range-end bg-indigo-600 text-white font-bold rounded-r-md shadow-md",
        day_selected: "bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-600 focus:text-white font-bold rounded-md shadow-md",
        day_today: "bg-gray-800 text-indigo-400 font-bold border border-indigo-500/50",
        day_outside: "text-gray-600 opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-gray-700 opacity-30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-indigo-600/40 aria-selected:text-white font-medium rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4 text-gray-400", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4 text-gray-400", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
