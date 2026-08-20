import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

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
      className={cn("p-4 bg-gray-950 text-white rounded-2xl border border-gray-800 select-none min-w-[280px]", className)}
      classNames={{
        months: "relative flex flex-col space-y-3",
        month: "space-y-3",
        month_caption: "flex justify-center items-center h-9 relative font-bold text-sm text-gray-100",
        caption_label: "text-sm font-bold text-gray-100",
        nav: "flex items-center justify-between w-full absolute top-0 left-0 right-0 h-9 px-1 pointer-events-none z-10",
        button_previous: "h-7 w-7 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer pointer-events-auto transition-all",
        button_next: "h-7 w-7 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer pointer-events-auto transition-all",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full justify-between pb-2 border-b border-gray-800/60 mb-2",
        weekday: "w-9 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider",
        weeks: "space-y-1",
        week: "flex w-full justify-between mt-1",
        day: "h-9 w-9 p-0 text-center text-xs relative flex items-center justify-center rounded-lg transition-all",
        day_button: "h-9 w-9 p-0 font-medium text-xs rounded-lg flex items-center justify-center hover:bg-gray-800 hover:text-white cursor-pointer transition-all w-full h-full text-gray-200",
        selected: "bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-500",
        range_start: "bg-indigo-600 text-white font-bold rounded-l-lg shadow-md",
        range_end: "bg-indigo-600 text-white font-bold rounded-r-lg shadow-md",
        range_middle: "bg-indigo-600/30 text-white font-medium rounded-none",
        today: "border border-indigo-500/60 text-indigo-400 font-bold bg-gray-900/60",
        outside: "text-gray-600 opacity-40 hover:opacity-100",
        disabled: "text-gray-700 opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4 text-gray-300", className)} {...props} />
          }
          return <ChevronRight className={cn("h-4 w-4 text-gray-300", className)} {...props} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
