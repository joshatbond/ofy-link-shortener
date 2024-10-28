import { useRef } from 'react';



import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


const STROKE = 1

/**
 * A number only chart
 */
export function Chart(props: {
  width: number
  height: number
  xAxis: string[]
  yAxis: string[]
  /**
   * points: An array of points. Each value corresponds to the element index from within the xAxis/yAxis arrays
   */
  points: Point[]
  precision: number
  useHorizontalGuidelines?: boolean
  useVerticalGuidelines?: boolean
  debug?: boolean
}) {
  const ref = useRef<SVGSVGElement>(null)
  const { toast } = useToast()
  const characters = props.yAxis.reduce(
    (a, v) => (a > v.length ? a : v.length),
    0
  )

  const FONT_SIZE = props.width / 50

  const padding = (FONT_SIZE + characters) * 3
  const chartWidth = props.width - padding * 2
  const chartHeight = props.height - padding * 2

  const coords = {
    xs: props.xAxis.map(
      (_, index) => padding + ((index + 1) / props.xAxis.length) * chartWidth
    ),
    ys: props.yAxis.map(
      (_, index) =>
        padding + chartHeight - (chartHeight * (index + 1)) / props.yAxis.length
    ),
  }
  const points = props.points.map(({ x, y }) => ({
    x: x < 0 ? padding : coords.xs[x],
    y: y < 0 ? props.height - padding : coords.ys[y],
  }))
  const handleCopy = () => {
    if (!ref.current) return
    console.log(ref.current)

    const svgString = new XMLSerializer().serializeToString(ref.current)

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
          variant: 'destructive'
        })

        console.error('Failed to copy svg', err)
      })
  }

  return (
    <div className='p-4'>
      <svg ref={ref} viewBox={`0 0 ${props.width} ${props.height}`}>
        {props.debug ? (
          <>
            <rect
              x={0}
              y={0}
              width={props.width}
              height={props.height}
              strokeWidth={1}
              stroke="red"
            />
            <rect
              x={padding}
              y={padding}
              width={chartWidth}
              height={chartHeight}
              strokeWidth={1}
              stroke="blue"
            />
          </>
        ) : null}
        {props.useHorizontalGuidelines && props.yAxis.length > 0 && (
          <Guidelines
            dir="row"
            inlinePos={[padding, ...coords.ys]}
            blockPos={[padding, props.width - padding]}
          />
        )}
        <XAxis
          start={{ x: padding, y: props.height - padding }}
          end={{ x: props.width - padding, y: props.height - padding }}
        />
        <AxisLabel
          dir="row"
          fontSize={FONT_SIZE}
          inlinePos={props.height - padding + FONT_SIZE * 2}
          blockPos={['', ...props.xAxis].map((x, index) => ({
            label: `${x}`,
            value:
              padding +
              (index / props.xAxis.length) * chartWidth -
              FONT_SIZE / 2,
          }))}
        />

        {props.useVerticalGuidelines && props.xAxis.length > 0 && (
          <Guidelines
            dir="column"
            inlinePos={[...coords.xs, props.width - padding]}
            blockPos={[padding, props.height - padding]}
          />
        )}
        <YAxis
          start={{ x: padding, y: padding }}
          end={{ x: padding, y: props.height - padding }}
        />
        <AxisLabel
          dir="column"
          fontSize={FONT_SIZE}
          inlinePos={padding - FONT_SIZE * 1.5}
          blockPos={['', ...props.yAxis].map((y, index) => ({
            label: `${y}`,
            value:
              props.height -
              padding -
              (index / props.yAxis.length) * chartHeight +
              FONT_SIZE / 2,
          }))}
        />

        {props.xAxis.length > 0 && props.yAxis.length > 0 ? (
          <>
            {points.map((point, index) => (
              <circle
                cx={point.x}
                cy={point.y}
                r={FONT_SIZE / 2}
                key={index}
                fill="#0074d9"
              />
            ))}

            <polyline
              fill="none"
              stroke="#0074d9"
              strokeWidth={STROKE}
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
            />
          </>
        ) : null}
      </svg>

      <div className='flex justify-center'>
      <Button className="w-full max-w-xs" onClick={handleCopy}>
        Copy to Clipboard
      </Button>
      </div>
    </div>
  )
}
function Line({
  start: { x: x1, y: y1 },
  end: { x: x2, y: y2 },
  fill = 'none',
  stroke = '#ccc',
  strokeWidth = '0.5',
}: LinePoints & { fill?: string; stroke?: string; strokeWidth?: string }) {
  return (
    <polyline
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      points={`${x1},${y1} ${x2},${y2}`}
    />
  )
}
function XAxis(props: LinePoints) {
  return <Line {...props} />
}
function YAxis(props: LinePoints) {
  return <Line {...props} />
}
function AxisLabel(props: {
  dir: 'row' | 'column'
  fontSize: number
  inlinePos: number
  blockPos: Array<{ value: number; label: string }>
}) {
  return props.blockPos.map((pos, index) => (
    <text
      key={index}
      x={
        props.dir === 'row'
          ? Number.isNaN(pos.value)
            ? 0
            : pos.value
          : props.inlinePos
      }
      y={
        props.dir === 'row'
          ? props.inlinePos
          : Number.isNaN(pos.value)
            ? 0
            : pos.value
      }
      style={{
        fill: '#808080',
        fontSize: props.fontSize,
        fontFamily: 'Helvetica',
      }}
      textAnchor={props.dir === 'row' ? 'middle' : 'end'}
    >
      {pos.label}
    </text>
  ))
}
function Guidelines(props: {
  inlinePos: number[]
  blockPos: [start: number, end: number]
  dir: 'row' | 'column'
}) {
  return props.inlinePos.map((pos, index) =>
    props.dir === 'row' ? (
      <Line
        key={index}
        start={{ x: props.blockPos[0], y: pos }}
        end={{ x: props.blockPos[1], y: pos }}
      />
    ) : (
      <Line
        key={index}
        start={{ x: pos, y: props.blockPos[0] }}
        end={{ x: pos, y: props.blockPos[1] }}
      />
    )
  )
}

export type Point = { id?: string; x: number; y: number }
type LinePoints = { start: Point; end: Point }