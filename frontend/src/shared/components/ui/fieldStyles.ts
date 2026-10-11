export const fieldBox = (invalid: boolean) =>
  `min-h-12 rounded-xl bg-white text-tinta transition-colors focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-bosque ${
    invalid ? 'border-2 border-error' : 'border border-borde'
  }`
