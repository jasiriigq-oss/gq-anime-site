import { Nullable } from './Nullable'

export interface StandardSiteResponse<T> {
  domain: string
  error: boolean
  success: boolean
  messages: string[]
  data: Nullable<T>
  hint_http?: number
}
