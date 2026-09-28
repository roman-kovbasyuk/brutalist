import { useId } from 'react'
import { Container, Divider, Grid, Stack, Text } from '../atoms'
import { TextAction } from '../components'
import './site-footer.css'

export type SiteFooterLink = { id: string; label: string; href: string }
export type SiteFooterGroup = { id: string; title: string; links: readonly SiteFooterLink[] }
export type SiteFooterProps = {
  brand: { label: string; href: string }
  description?: string
  /** Each group with links renders as a navigation landmark named by its title. */
  groups: readonly SiteFooterGroup[]
  legal?: readonly SiteFooterLink[]
  /** Rendered exactly as supplied; the footer adds no year or symbol. */
  copyright?: string
}

/** A website footer: brand, optional description, labelled link groups and a publication line. */
export function SiteFooter({ brand, description, groups, legal = [], copyright }: SiteFooterProps) {
  const id = useId()
  const linkedGroups = groups.filter(group => group.links.length > 0)
  const hasPublication = legal.length > 0 || Boolean(copyright)
  return <footer className="b-site-footer">
    <Container className="b-site-footer__inner">
      <Stack gap={8}>
        <div className="b-site-footer__main">
          <Stack gap={3} className="b-site-footer__identity">
            <a href={brand.href} className="b-site-footer__brand"><Text as="span" variant="h5" tone="inherit">{brand.label}</Text></a>
            {description && <Text variant="small" tone="secondary">{description}</Text>}
          </Stack>
          {linkedGroups.length > 0 && <Grid gap={6} minItemWidth="9rem" className="b-site-footer__groups">
            {linkedGroups.map((group, index) => {
              const titleId = `${id}-group-${index}`
              return <nav key={group.id} aria-labelledby={titleId}>
                <Stack gap={3}>
                  <Text id={titleId} variant="h7" tone="secondary">{group.title}</Text>
                  <ul className="b-site-footer__links">
                    {group.links.map(link => <li key={link.id}><TextAction href={link.href}>{link.label}</TextAction></li>)}
                  </ul>
                </Stack>
              </nav>
            })}
          </Grid>}
        </div>
        {hasPublication && <Stack gap={6}>
          <Divider />
          <div className="b-site-footer__publication">
            {copyright && <Text variant="small" tone="secondary">{copyright}</Text>}
            {legal.length > 0 && <ul className="b-site-footer__legal">
              {legal.map(link => <li key={link.id}><TextAction href={link.href}>{link.label}</TextAction></li>)}
            </ul>}
          </div>
        </Stack>}
      </Stack>
    </Container>
  </footer>
}
