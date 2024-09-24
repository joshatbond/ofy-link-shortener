import { init } from '@paralleldrive/cuid2'

const createId = init({ length: 10 })

const mockLink = {
  title: 'Link 1',
  url: 'https://uploadthing.com/',
  image: 'https://utfs.io/f/sDIWXz0vAKcnco8gnnUX9VbPOF21UChKnk5oQZrEBM6RmAx3',
  description: 'A link to UploadThing',
}
export const mockData = new Array(10)
  .fill(mockLink)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  .map(link => ({ ...link, id: createId() })) as LinkWithId[]

type Link = typeof mockLink
type LinkWithId = Link & { id: string }
