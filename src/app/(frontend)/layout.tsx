import React from 'react'
import '@/m0ves/styles/app.css'
import { CopyrightFooter, FooterNavigation } from '@/m0ves/components/Footers'
import DefaultNavigation from '@/m0ves/plugins/navigation/DefaultNavigation'
import { getNavigationData } from '@/m0ves/plugins/navigation/operations'
import { getSiteIdentityData } from '@/m0ves/plugins/site-identity/operations'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const navigation = await getNavigationData()
  const id = await getSiteIdentityData()

  return (
    <html lang="en" data-theme="m0ves">
      <body>
        <DefaultNavigation navigation={navigation} id={id} />
        <main className="mt-20">{children}</main>
        <FooterNavigation />
        <CopyrightFooter />
      </body>
    </html>
  )
}
