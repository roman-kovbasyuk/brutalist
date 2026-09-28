import { useId, type ReactNode } from 'react'
import { Heading, Surface, Text } from '../atoms'
import { Avatar, DescriptionList, Tag, type DescriptionListProps } from '../components'
import './profile-blocks.css'

export type ProfileSummaryProps = {
  name: string
  kind?: 'person' | 'organization'
  description?: string
  avatarSrc?: string
  details: DescriptionListProps['items']
  actions?: ReactNode
}

export function ProfileSummary({ name, kind = 'person', description, avatarSrc, details, actions }: ProfileSummaryProps) {
  const id = useId()
  return <Surface as="section" padding={0} className="b-profile-summary" aria-labelledby={`${id}-title`}>
    <div className="b-profile-summary__identity">
      <Avatar name={name} src={avatarSrc} size="large" shape={kind === 'organization' ? 'square' : 'circle'} />
      <div className="b-profile-summary__heading">
        <div className="b-profile-summary__name">
          <Heading id={`${id}-title`} level={2} variant="h4">{name}</Heading>
          <Tag>{kind === 'organization' ? 'Organization' : 'Person'}</Tag>
        </div>
        {description && <Text tone="secondary">{description}</Text>}
      </div>
      {actions && <div className="b-profile-summary__actions">{actions}</div>}
    </div>
    {details.length > 0 && <div className="b-profile-summary__details"><DescriptionList label="Profile details" items={details} layout="columns" /></div>}
  </Surface>
}
