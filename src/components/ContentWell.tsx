export interface ContentWellProps extends React.PropsWithChildren {
  className?: string
}
export const ContentWell: React.FC<ContentWellProps> = ({
  children,
  className,
}: ContentWellProps) => {
  return (
    <div className={`p-4 rounded-3xl border-6 bg-neutral-content ${className}`}>{children}</div>
  )
}
