'use client'

import { Plus, Settings2Icon, Trash2 } from 'lucide-react'
import {
  type ChangeEvent,
  type Dispatch,
  ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
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
import { createId } from '@/lib/id'

import { Chart, type Point } from './chart'

function useScopedState(props: { min: number; max: number; initial?: number }) {
  if (
    props.initial &&
    (props.initial < props.min || props.initial > props.max)
  ) {
    throw new Error(`Initial value ${props.initial} is out of bounds`)
  }

  const [state, stateAssign] = useState({
    min: props.min,
    max: props.max,
    value: props.initial ?? (props.max - props.min) / 2,
  })

  const updateState = (key: 'min' | 'max' | 'value', value: number) => {
    if (key === 'value' && (value < state.min || value > state.max)) {
      throw new Error(`Value ${value} is out of bounds`)
    }

    stateAssign(p => ({ ...p, [key]: value }))
  }

  return [state, updateState] as const
}

export function ClientPage() {
  const [width, widthAssign] = useScopedState({ min: 0, max: 500 })
  const [height, heightAssign] = useScopedState({ min: 0, max: 200 })

  const [useHorizontalGuidelines, useHorizontalGuidelinesAssign] =
    useState(true)
  const [useVerticalGuidelines, useVerticalGuidelinesAssign] = useState(true)
  const [xAxisEntries, xAxisEntriesAssign] = useState<string[]>([])
  const [xAxisInput, xAxisInputAssign] = useState(xAxisEntries.join(', '))
  const [yAxisEntries, yAxisEntriesAssign] = useState<string[]>([])
  const [yAxisInput, yAxisInputAssign] = useState(yAxisEntries.join(', '))
  const [points, pointsAssign] = useState<Point[]>([])
  const [precision, precisionAssign] = useState(2)
  const [debugMode, debugModeAssign] = useState(false)
  const [renderPoints, renderPointsAssign] = useState(true)

  const handleLabelUpdate =
    (type: 'x' | 'y') => (e: ChangeEvent<HTMLInputElement>) => {
      const values = e.target.value.trim().split(',').filter(Boolean)
      if (type === 'x') {
        xAxisInputAssign(e.target.value)
        xAxisEntriesAssign(values)
      } else {
        yAxisInputAssign(e.target.value)
        yAxisEntriesAssign(values)
      }
    }

  return (
    <div className="grid grid-cols-[auto_1fr] lg:grid-cols-[1fr_3fr]">
      <Tabs
        defaultValue="points"
        className="h-[calc(100vh-64px)] space-y-4 overflow-auto bg-[#121212] p-4"
      >
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="points">
            Plot
          </TabsTrigger>

          <TabsTrigger className="flex-1" value="settings">
            <Settings2Icon />
          </TabsTrigger>
        </TabsList>

        <TabsContent className="max-w-[250px] space-y-4" value="points">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Axes</h2>

            <div className="pl-8">
              <h3 className="text-lg font-medium">X-Axis Labels</h3>
              <Input
                value={xAxisInput}
                onChange={handleLabelUpdate('x')}
                className="pl-8"
              />
            </div>

            <div className="pl-8 pt-4">
              <h3 className="text-lg font-medium">Y-Axis Labels</h3>
              <Input
                value={yAxisInput}
                onChange={handleLabelUpdate('y')}
                className="pl-8"
              />
            </div>
          </div>

          <PointForm
            points={points}
            updatePoints={pointsAssign}
            xLabels={xAxisEntries}
            yLabels={yAxisEntries}
          >
            <div className="flex items-center gap-4">
            <Switch checked={renderPoints} onCheckedChange={renderPointsAssign} />
            <div>Show Points</div>
          </div>
          </PointForm>
        </TabsContent>

        <TabsContent className="max-w-[250px] space-y-4" value="settings">
          <div className="flex items-center gap-4">
            <Switch checked={debugMode} onCheckedChange={debugModeAssign} />
            <div>Debug Mode</div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Width</h2>

            <div className="flex items-baseline gap-4 pl-8">
              <p className="w-20">Min</p>

              <Input
                value={width.min}
                onChange={e => widthAssign('min', +e.target.value)}
              />
            </div>

            <div className="flex items-baseline gap-4 pl-8">
              <p className="w-20">Max</p>

              <Input
                value={width.max}
                onChange={e => widthAssign('max', +e.target.value)}
              />
            </div>

            <Slider
              value={[width.value]}
              onValueChange={([value]) => widthAssign('value', value!)}
              min={width.min}
              max={width.max}
              step={1}
              className="flex-1 py-4"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Height</h2>

            <div className="flex items-baseline gap-4 pl-8">
              <p className="w-20">Min</p>

              <Input
                value={height.min}
                onChange={e => heightAssign('min', +e.target.value)}
              />
            </div>

            <div className="flex items-baseline gap-4 pl-8">
              <p className="w-20">Max</p>

              <Input
                value={height.max}
                onChange={e => heightAssign('max', +e.target.value)}
              />
            </div>

            <Slider
              value={[height.value]}
              onValueChange={([value]) => heightAssign('value', value!)}
              min={height.min}
              max={height.max}
              step={1}
              className="flex-1 py-4"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Guidelines</h2>
            <div className="flex items-center gap-4 pl-8">
              <Switch
                checked={useHorizontalGuidelines}
                onCheckedChange={useHorizontalGuidelinesAssign}
              />
              <div>Show Horizontal Guidelines</div>
            </div>

            <div className="flex items-center gap-4 pl-8">
              <Switch
                checked={useVerticalGuidelines}
                onCheckedChange={useVerticalGuidelinesAssign}
              />
              <div>Show Vertical Guidelines</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Chart
        width={width.value}
        height={height.value}
        precision={precision}
        xAxis={xAxisEntries}
        yAxis={yAxisEntries}
        points={renderPoints ? points : []}
        useHorizontalGuidelines={useHorizontalGuidelines}
        useVerticalGuidelines={useVerticalGuidelines}
        debug={debugMode}
      />
    </div>
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

      <div className="space-y-2">
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
            <SelectItem key={index} value={x}>
              {x}
            </SelectItem>
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
            <SelectItem key={index} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="destructive" onClick={handleDelete}>
        <Trash2 />
      </Button>
    </div>
  )
}
