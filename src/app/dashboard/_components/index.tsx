'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/dist/server/api-utils'
import Link from 'next/link'
import { type ReactNode, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip } from '@/components/ui/tooltip'
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type findLinks } from '@/server/db/actions'

export function Dashboard(props: { links: Link[] }) {
  const [activeLinkId, activeLinkIdAssign] = useState<string | null>(null)
  const activeLink = useMemo(() => {
    if (!activeLinkId) return undefined
    return props.links.find(link => link.id === activeLinkId)
  }, [activeLinkId, props.links])

  return (
    <div className="p-4">
      <Sheet>
        <SheetContent>
          {activeLink && <EditLink link={activeLink} />}
        </SheetContent>

        <h1 className="mb-8 text-xl">Dashboard</h1>

        <div className="flex flex-wrap gap-4">
          {props.links.map(link => (
            <LinkCard key={link.id} link={link}>
              <SheetTrigger onClick={() => activeLinkIdAssign(link.id)}>
                Edit
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
    <Card className="min-w-80">
      <CardHeader>
        <CardTitle>{props.link.slug}</CardTitle>
        <CardDescription>{props.link.description}</CardDescription>
      </CardHeader>

      <CardFooter className="justify-between">
        <Link href={props.link.redirectUrl} target="_blank">
          Go to URL
        </Link>
        {props.children}
      </CardFooter>
    </Card>
  )
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
function FormItemWrapper(props: {
  children: ReactNode
  label: string
  description?: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <FormItem>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>{props.children}</FormControl>
            <FormMessage />
          </FormItem>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="start" sideOffset={-24}>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

type Link = Awaited<ReturnType<typeof findLinks>>[number]
