export interface ContentWellProps extends React.PropsWithChildren {
  className?: string
}
export const ContentWell: React.FC<ContentWellProps> = ({
  children,
  className,
}: ContentWellProps) => {
  return <div className={`p-2 rounded-3xl border-2 ${className}`}>{children}</div>
}
