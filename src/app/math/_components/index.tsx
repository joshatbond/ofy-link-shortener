'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TooltipContent } from '@radix-ui/react-tooltip'
import { Info, Plus, Trash2 } from 'lucide-react'
import {
  type Dispatch,
  Fragment,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { createId } from '@/lib/id'

import { Chart, type Point } from './chart'

const formSchema = z.object({
  debug: z.boolean(),

  width: z.number().min(0),
  widthMin: z.number().min(0),
  widthMax: z.number().min(0),

  height: z.number().min(0),
  heightMin: z.number().min(0),
  heightMax: z.number().min(0),

  precision: z.number().min(1),

  useHorizontalGuidelines: z.boolean(),
  useVerticalGuidelines: z.boolean(),
  showPoints: z.boolean(),

  labelsX: z.string(),
  labelsY: z.string(),
})

export function ClientPage() {
  const chartRef = useRef<SVGSVGElement>(null)
  const { toast } = useToast()
  const formState = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: 'onBlur',
    defaultValues: {
      width: 250,
      widthMin: 0,
      widthMax: 500,

      height: 100,
      heightMin: 0,
      heightMax: 200,

      precision: 2,

      useHorizontalGuidelines: true,
      useVerticalGuidelines: true,
      showPoints: true,

      labelsX: '',
      labelsY: '',
    },
  })
  const [points, pointsAssign] = useState<Point[]>([])

  const xLabels = formState
    .watch('labelsX')
    .trim()
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
  const yLabels = formState
    .watch('labelsY')
    .trim()
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  const handleCopy = () => {
    console.log(chartRef)
    if (!chartRef.current) return

    const svgString = new XMLSerializer().serializeToString(chartRef.current)

    navigator.clipboard
      .writeText(svgString)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'The graph was copied to your clipboard.',
        })
      })
      .catch(err => {
        toast({
          title: 'Failed to copy!',
          description: 'See the console for the specific error.',
          variant: 'destructive',
        })

        console.error('Failed to copy svg', err)
      })
  }

  return (
    <div className="grid h-screen grid-rows-[5fr_minmax(300px,_3fr)]">
      <Chart
        width={formState.watch('width')}
        height={formState.watch('height')}
        precision={formState.watch('precision')}
        xAxis={xLabels}
        yAxis={yLabels}
        points={formState.watch('showPoints') ? points : []}
        useHorizontalGuidelines={formState.watch('useHorizontalGuidelines')}
        useVerticalGuidelines={formState.watch('useVerticalGuidelines')}
        debug={formState.watch('debug')}
        ref={chartRef}
      />

      <Form {...formState}>
        <div className="flex bg-[#121212]">
          <Tabs defaultValue="points" variant="vertical">
            <TabsList variant="vertical">
              <Button
                onClick={handleCopy}
                className="bg-blue-700 text-white hover:bg-blue-500 focus-visible:bg-blue-500 active:bg-blue-500"
              >
                Copy Graph
              </Button>

              {
                [
                  { value: 'points', label: 'Plot' }, 
                  { value: 'settings', label: 'Settings' }
                ].map(tab => (
                  <TabsTrigger 
                    value={tab.value} 
                    key={tab.value} 
                    variant="vertical" 
                    className="min-w-24"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))
              }
            </TabsList>

            <TabsContent
              value="points"
              variant="vertical"
              className="grid grid-cols-2 gap-4 px-1 py-0"
            >
              <div className="card space-y-2 rounded p-4">
                <h2 className="flex select-none items-center gap-1 text-xl font-semibold">
                  Axes
                  <AxesTooltip />
                </h2>

                <FormField
                  control={formState.control}
                  name="labelsX"
                  render={({ field }) => (
                    <FormItem className="flex select-none items-baseline gap-4 pl-8">
                      <FormLabel className="whitespace-nowrap">
                        X-Axis
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter a comma-separated list of values..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={formState.control}
                  name="labelsY"
                  render={({ field }) => (
                    <FormItem className="flex select-none items-baseline gap-4 pl-8">
                      <FormLabel className="whitespace-nowrap">
                        Y-Axis
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter a comma-separated list of values..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="card space-y-8 rounded p-4">
                <PointForm
                  points={points}
                  updatePoints={pointsAssign}
                  xLabels={xLabels}
                  yLabels={yLabels}
                >
                  <FormField
                    control={formState.control}
                    name="showPoints"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Show Points</FormLabel>
                      </FormItem>
                    )}
                  />
                </PointForm>
              </div>
            </TabsContent>

            <TabsContent
              value="settings"
              variant="vertical"
              className="grid grid-cols-2 gap-4 p-1 pt-0"
            >
              <div className="card space-y-4 rounded p-4">
                <FormField
                  control={formState.control}
                  name="debug"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Debug Mode</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Guidelines</h2>

                  <FormField
                    control={formState.control}
                    name="useHorizontalGuidelines"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Show Horizontal Guidelines</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formState.control}
                    name="useVerticalGuidelines"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Show Horizontal Guidelines</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="card space-y-8 rounded p-4">
                <div className="space-y-4">
                  <h2 className="flex items-baseline gap-4 text-xl font-semibold">
                    Width{': '}
                    <span className="text-base font-normal">
                      {formState.watch('width')}
                    </span>
                  </h2>

                  <FormField
                    control={formState.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem className="flex items-baseline gap-4 pl-8">
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value!)}
                            min={formState.watch('widthMin')}
                            max={formState.watch('widthMax')}
                            step={1}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <FormField
                      control={formState.control}
                      name="widthMin"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline gap-4 pl-8">
                          <FormLabel>Min</FormLabel>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formState.control}
                      name="widthMax"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline gap-4 pl-8">
                          <FormLabel>Max</FormLabel>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="flex items-baseline gap-4 text-xl font-semibold">
                    Height:{' '}
                    <span className="text-base font-normal">
                      {formState.watch('height')}
                    </span>
                  </h2>

                  <FormField
                    control={formState.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="flex items-baseline gap-4 pl-8">
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value!)}
                            min={formState.watch('heightMin')}
                            max={formState.watch('heightMax')}
                            step={1}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <FormField
                      control={formState.control}
                      name="heightMin"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline gap-4 pl-8">
                          <FormLabel>Min</FormLabel>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formState.control}
                      name="heightMax"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline gap-4 pl-8">
                          <FormLabel>Max</FormLabel>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Form>
    </div>
  )
}

function AxesTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          sideOffset={24}
          align="start"
          className="max-w-sm rounded-lg border border-white bg-black p-4"
        >
          <h3 className="text-xl font-semibold">Hint</h3>

          <p className="pl-2 text-sm">
            Each axis should be a comma-separated list of values.
          </p>
          <p className="pl-2 pt-2 text-sm">
            Using a &apos;_&apos; for one of the values will cause a blank
            guideline to be created.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function PointForm(props: {
  points: Point[]
  xLabels: string[]
  yLabels: string[]
  updatePoints: Dispatch<SetStateAction<Point[]>>
  children: ReactNode
}) {
  const [userPoints, userPointsAssign] = useState<
    Array<{ id: string; x: number; y: number }>
  >([])
  const addNewPoint = () =>
    userPointsAssign(p => [...p, { id: createId(), x: 0, y: 0 }])
  const updatePoint = (point: (typeof userPoints)[number], type?: 'delete') => {
    if (type) {
      userPointsAssign(prev => prev.filter(p => p.id !== point.id))
      props.updatePoints(prev => prev.filter(p => p.id !== point.id))
      return
    }
    userPointsAssign(prev => prev.map(p => (p.id !== point.id ? p : point)))
    props.updatePoints(prev => {
      if (prev.find(p => p.id === point.id)) {
        return prev.map(p => (p.id === point.id ? point : p))
      } else {
        return [...prev, point]
      }
    })
  }

  useEffect(() => {
    function eventHandler(e: KeyboardEvent) {
      if (e.key === 'Enter') addNewPoint()
    }

    window.addEventListener('keydown', eventHandler)

    return () => window.removeEventListener('keydown', eventHandler)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Points</h2>

        <Button variant="outline" onClick={addNewPoint}>
          <Plus />
        </Button>
      </div>

      {props.children}

      <div className="h-[159px] space-y-2 overflow-auto overscroll-contain">
        {userPoints.map((point, index) => (
          <PointSelect
            key={index}
            point={point}
            xs={props.xLabels}
            ys={props.yLabels}
            updateFn={updatePoint}
            hasFocus={index === userPoints.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function PointSelect(props: {
  point: { id: string; x: number; y: number }
  xs: string[]
  ys: string[]
  updateFn: (
    point: { id: string; x: number; y: number },
    type?: 'delete'
  ) => void
  hasFocus: boolean
}) {
  const [xSelect, xAssign] = useState(
    props.point.x ? props.xs[props.point.x] : ''
  )
  const [ySelect, yAssign] = useState(
    props.point.y ? props.ys[props.point.y] : ''
  )

  const handleChange = (type: 'x' | 'y') => (value: string) => {
    if (type === 'x') xAssign(value)
    if (type === 'y') yAssign(value)

    const x = convertValue(props.xs, type === 'x' ? value : xSelect)

    const y = convertValue(props.ys, type === 'y' ? value : ySelect)

    if (x != null && y != null) props.updateFn({ id: props.point.id, x, y })

    function convertValue(arr: string[], value?: string) {
      if (!value) return null
      if (value === '-2') return -2
      return arr.indexOf(value)
    }
  }
  const handleDelete = () => {
    props.updateFn(props.point, 'delete')
  }

  return (
    <div className="flex gap-4">
      <Select value={xSelect} onValueChange={handleChange('x')}>
        <SelectTrigger autoFocus={props.hasFocus}>
          <SelectValue placeholder="" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="-2">0</SelectItem>

          {props.xs.map((x, index) => (
            <Fragment key={index}>
              {x === '_' ? null : <SelectItem value={x}>{x}</SelectItem>}
            </Fragment>
          ))}
        </SelectContent>
      </Select>

      <Select value={ySelect} onValueChange={handleChange('y')}>
        <SelectTrigger>
          <SelectValue placeholder="" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="-2">0</SelectItem>

          {props.ys.map((y, index) => (
            <Fragment key={index}>
              {y === '_' ? null : <SelectItem value={y}>{y}</SelectItem>}
            </Fragment>
          ))}
        </SelectContent>
      </Select>

      <Button variant="destructive" onClick={handleDelete}>
        <Trash2 />
      </Button>
    </div>
  )
}
