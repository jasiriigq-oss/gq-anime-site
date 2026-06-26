export type RouteProps<T> = {
  params: Promise<T>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
