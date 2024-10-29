'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

const tabRootVariants = cva('', {
  variants: {
    variant: {
      default: '',
      vertical:
        'flex w-full rounded-md p-1 border-3 border-white text-muted-foreground gap-5',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> &
    VariantProps<typeof tabRootVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    orientation={variant === 'vertical' ? 'vertical' : 'horizontal'}
    className={cn(tabRootVariants({ variant, className }))}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const tabListVariants = cva(
  'items-center text-muted-foreground p-1 bg-muted rounded-md',
  {
    variants: {
      variant: {
        default: 'inline-flex h-10 justify-center',
        vertical: 'flex flex-col gap-2 h-auto justify-start',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabListVariants({ variant, className }))}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabTriggerVariants = cva(
  'items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  {
    variants: {
      variant: {
        default: 'inline-flex justify-center',
        vertical: 'flex justify-start',
      },
      defaultVariants: {
        variant: 'default',
      },
    },
  }
)
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabTriggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabTriggerVariants({ variant, className }))}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const tabContentVariants = cva(
  'pt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        vertical: 'flex-grow data-[state=inactive]:hidden',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    VariantProps<typeof tabContentVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabContentVariants({ variant, className }))}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
