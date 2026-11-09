import { lazy } from 'react'

export const MethodologyPage = lazy(() =>
  import('./MethodologyPage').then((module) => ({ default: module.MethodologyPage })),
)
export const JoinPage = lazy(() => import('./JoinPage').then((module) => ({ default: module.JoinPage })))
export const ContactPage = lazy(() =>
  import('./ContactPage').then((module) => ({ default: module.ContactPage })),
)
