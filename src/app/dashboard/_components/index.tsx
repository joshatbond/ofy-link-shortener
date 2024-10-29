'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { GlobeIcon, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
// import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItemWrapper } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { type findLinks } from '@/server/db/actions'

export function Dashboard(props: { links: Link[] }) {
  const [activeLinkId, activeLinkIdAssign] = useState<string | null>(null)
  const activeLink = useMemo(() => {
    if (!activeLinkId) return undefined
    return props.links.find(link => link.id === activeLinkId)
  }, [activeLinkId, props.links])

  return (
    <div className="radial-gradient">
      <form className="flex flex-1 justify-center gap-[6px] border-t border-[#979797] bg-[#050504] px-4 py-2 md:justify-start">
        <Input
          placeholder="Find or create a shortcut"
          className="w-auto max-w-sm flex-1"
        />

        <Button variant="default" type="submit" className="bg-[#999999]">
          Search
        </Button>
      </form>

      <Sheet>
        <SheetContent className="h-full">
          {activeLink && <EditLink link={activeLink} />}
        </SheetContent>

        <div className="flex flex-wrap gap-x-6 gap-y-4 p-4">
          {props.links.map(link => (
            <LinkCard key={link.id} link={link}>
              <SheetTrigger onClick={() => activeLinkIdAssign(link.id)}>
                <Settings2 className="focus-within:text-[#30b9ff] hover:text-[#30b9ff] active:text-[#30b9ff]" />
              </SheetTrigger>
            </LinkCard>
          ))}
        </div>
      </Sheet>

      <button className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 text-2xl">
        +
      </button>
    </div>
  )
}

function LinkCard(props: { link: Link; children?: ReactNode }) {
  return (
    <div className="card gradient flex min-w-[220px] flex-1 flex-col items-center gap-6 rounded-md p-6">
      <h2 className="flex-1 self-stretch text-ellipsis text-xl font-bold leading-[20px] text-white">
        {props.link.slug}
      </h2>

      <div className="flex items-center justify-between self-stretch">
        <Link href={props.link.redirectUrl} target="_blank">
          <GlobeIcon className="focus-within:text-[#30b9ff] hover:text-[#30b9ff] active:text-[#30b9ff]" />
        </Link>

        {props.children}
      </div>
    </div>
  )
  // return (
  //   <Card className="min-w-80">
  //     <CardHeader>
  //       <CardTitle>{props.link.slug}</CardTitle>
  //     </CardHeader>

  //     <CardFooter className="justify-between">
  //       <Link href={props.link.redirectUrl} target="_blank">
  //         Go to URL
  //       </Link>

  //       {props.children}
  //     </CardFooter>
  //   </Card>
  // )
}
const formSchema = z.object({
  slug: z.string().min(1),
  redirectUrl: z.string().url(),
  description: z.string().optional(),
  expires: z.coerce
    .date()
    .optional()
    .refine(data => data && data > new Date(), {
      message: 'Expiration date must be in the future',
    })
    .transform(data => (data ? Math.floor(data.getTime() / 1000) : null)),
  disabled: z.boolean().nullable(),
  isProtected: z.boolean().nullable(),
  passwordHash: z.string().nullable(),
})
function EditLink(props: { link: Link }) {
  const { id, created, userId, ...formLink } = props.link
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formLink,
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ id, created, userId, ...values })
  }

  return (
    <div>
      <SheetTitle>{props.link.slug}</SheetTitle>
      <SheetDescription className="sr-only">
        Use the form to edit the link fields
      </SheetDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItemWrapper
                label="Slug"
                description="This will be the name of the shortcut in the url"
                side="bottom"
                align="start"
                sideOffset={-24}
              >
                <Input placeholder="pathname" {...field} />
              </FormItemWrapper>
            )}
          />

          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}

type Link = Awaited<ReturnType<typeof findLinks>>[number]
