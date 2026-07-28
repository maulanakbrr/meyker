export interface DividerProps {
  label?: string
}

export function Divider({ label = 'OR' }: DividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[#0b0f19] px-3 text-gray-500 font-medium tracking-wider">{label}</span>
      </div>
    </div>
  )
}
