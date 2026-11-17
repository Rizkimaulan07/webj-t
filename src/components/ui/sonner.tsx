import type { ComponentProps } from "react"
import { Toaster as Sonner } from "sonner"

function Toaster(props: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast: "font-sans",
          title: "font-semibold",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
