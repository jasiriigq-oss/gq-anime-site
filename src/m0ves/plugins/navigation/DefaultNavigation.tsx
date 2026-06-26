'use client'
import { Navigation, NavigationLink, SiteIdentity } from '@/payload-types'
import Link from 'next/link'

const DefaultNavigation: React.FC<{ navigation: Navigation; id: SiteIdentity }> = ({
  navigation,
  id,
}) => {
  return (
    <div className="max-lg:collapse bg-base-200 shadow-sm z-50 rounded-md fixed w-screen top-0">
      <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
      <label
        htmlFor="navbar-1-toggle"
        className="fixed inset-0 hidden max-lg:peer-checked:block"
      ></label>
      <div className="collapse-title navbar">
        <div className="navbar-start">
          <label htmlFor="navbar-1-toggle" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <button className="btn btn-ghost text-xl">{id['site-name']}</button>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {navigation?.links?.map((nl) => (
              <DesktopNavItem navLink={nl?.link as any} key={nl.id} />
            ))}
          </ul>
        </div>
        <div className="navbar-end">
          <button className="btn">Contact Us</button>
        </div>
      </div>

      <div className="collapse-content lg:hidden z-1">
        <ul className="menu">
          {navigation.links?.map((nl) => (
            <MobileNavItem navLink={nl.link as any} key={nl.id} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DefaultNavigation

export interface DesktopNavItemProps extends React.PropsWithChildren {
  navLink?: NavigationLink
}
export const DesktopNavItem: React.FC<DesktopNavItemProps> = ({ navLink }: DesktopNavItemProps) => {
  if (navLink?.children && navLink.children.length > 0) {
    const children = navLink.children
    return (
      <li>
        <details>
          <summary>{navLink.title}</summary>
          <ul className="p-2 bg-base-100 w-40 z-1">
            <li>
              {/* the parent page */}
              <Link className="link" href={navLink.url ?? '#not-set'}>
                {navLink.title}
              </Link>
            </li>
            {children.map((child) => {
              return (
                <li key={child.id}>
                  {/* @ts-ignore */}
                  <Link className="link" href={child?.['Child Link']?.url ?? '#not-set'}>
                    {/* @ts-ignore */}
                    {child?.['Child Link']?.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </details>
      </li>
    )
  }
  return (
    <li>
      <Link className="link" href={navLink?.url ?? '#not-set'}>
        {navLink?.title}
      </Link>
    </li>
  )
}

export interface MobileNavItemProps extends React.PropsWithChildren {
  navLink?: NavigationLink
}
export const MobileNavItem: React.FC<DesktopNavItemProps> = ({ navLink }: MobileNavItemProps) => {
  if (navLink?.children && navLink.children.length > 0) {
    const children = navLink.children
    return (
      <li>
        <Link className="link" href={navLink.url ?? '#not-set'}>
          {navLink.title}
        </Link>
        <ul className="p-2 bg-base-100 w-40 z-1">
          {children.map((child) => {
            return (
              <li key={child.id}>
                {/* @ts-ignore */}
                <Link className="link" href={child?.['Child Link']?.url ?? '#not-set'}>
                  {/* @ts-ignore */}
                  {child?.['Child Link']?.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }
  return (
    <li>
      <Link className="link" href={navLink?.url ?? '#not-set'}>
        {navLink?.title}
      </Link>
    </li>
  )
}
