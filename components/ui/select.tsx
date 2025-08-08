import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        {children}
      </div>
    )
  }
)
Select.displayName = "Select"

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
>(({ className = "", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ placeholder = "Select...", ...props }, ref) => {
  return <span ref={ref} {...props}>{props.children || placeholder}</span>
})
SelectValue.displayName = "SelectValue"

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className = "", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative cursor-pointer select-none py-2 px-3 text-gray-900 hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"