import { useCallback, useState } from 'react'
import { Line, Circle, Group } from 'react-konva'
import Konva from 'konva'
import { Vector2d } from 'konva/lib/types'
import { ImageLineCrossingFormType } from './types'
import { limitValue, updateMouseCursor } from './utils'

const CrossingLine = ({
  stageWidth,
  stageHeight,
  start: groupAbsoluteStart,
  end: groupAbsoluteEnd,
  setStartPoint: setGroupAbsoluteStart,
  setEndPoint: setGroupAbsoluteEnd,
  setValueWithName,
}: {
  stageWidth: number
  stageHeight: number
  start: Vector2d | null
  end: Vector2d | null
  setStartPoint: React.Dispatch<React.SetStateAction<Vector2d | null>>
  setEndPoint: React.Dispatch<React.SetStateAction<Vector2d | null>>
  setValueWithName: (value: ImageLineCrossingFormType) => void
}) => {
  const [savedStartPoint, setSavedStartPoint] = useState<Vector2d | null>(null)

  const handleDragEvent = useCallback(
    (xValue: number, yValue: number, setFunc: typeof setGroupAbsoluteStart) => {
      const newX = limitValue(xValue, stageWidth)
      const newY = limitValue(yValue, stageHeight)
      setFunc({ x: newX, y: newY })
    },
    [stageHeight, stageWidth],
  )

  return (
    groupAbsoluteStart &&
    groupAbsoluteEnd && (
      <Group
        draggable
        // NOTE: The Group x/y should use the absolute position, we use it as start point
        x={groupAbsoluteStart.x}
        y={groupAbsoluteStart.y}
        onDragStart={(e) => {
          const target = e?.currentTarget
          // Save the start point to calculate moved distance when drag ends
          setSavedStartPoint({ x: target.x(), y: target.y() })
        }}
        onDragMove={(e) => {
          const target = e?.currentTarget
          const { x, y } = target.getAbsolutePosition()
          // limit the move area
          const xMovedDistance = groupAbsoluteEnd.x - groupAbsoluteStart.x
          const yMovedDistance = groupAbsoluteEnd.y - groupAbsoluteStart.y

          // the range changes when the start is behind or before end
          if (xMovedDistance > 0) {
            target.x(limitValue(x, stageWidth - xMovedDistance))
          } else {
            target.x(limitValue(x, stageWidth, 0 - xMovedDistance))
          }

          if (yMovedDistance > 0) {
            target.y(limitValue(y, stageHeight - yMovedDistance))
          } else {
            target.y(limitValue(y, stageHeight, 0 - yMovedDistance))
          }
        }}
        onDragEnd={(e) => {
          const target = e?.currentTarget
          // get the absolute of the group and save it as start point
          const { x, y } = target.getAbsolutePosition()
          // get the new end point based on the moved distance and previous end point
          const newEndPointX = x - (savedStartPoint?.x ?? 0) + groupAbsoluteEnd.x
          const newEndPointY = y - (savedStartPoint?.y ?? 0) + groupAbsoluteEnd.y
          // after we finish the drag, need to update the start and end points for the future actions
          setGroupAbsoluteStart({ x, y })
          setGroupAbsoluteEnd({ x: newEndPointX, y: newEndPointY })

          // calculate the values with form's format
          setValueWithName({
            x1: x / stageWidth,
            y1: y / stageHeight,
            x2: newEndPointX / stageWidth,
            y2: newEndPointY / stageHeight,
          })
        }}
      >
        <Line
          // NOTE: the node inside of group should use relative position
          points={[
            0,
            0,
            groupAbsoluteEnd.x - groupAbsoluteStart.x,
            groupAbsoluteEnd.y - groupAbsoluteStart.y,
          ]}
          stroke="green"
          strokeWidth={6}
          onMouseEnter={(e) => updateMouseCursor(e, 'grab')} // use grab cursor for line
        />
        {groupAbsoluteStart && (
          <Circle
            // NOTE: the start point of start circle should always have the static relative position to the Group
            x={0}
            y={0}
            draggable // circle can be dragged to extend the line
            onMouseEnter={(e) => updateMouseCursor(e, 'pointer')} // the cursor is pointer
            onDragEnd={(e: Konva.KonvaEventObject<MouseEvent>) => {
              // NOTE: MUST set the cancelBubble on the drag end event
              // eslint-disable-next-line no-param-reassign
              e.cancelBubble = true

              const target = e.target
              // get the absolute position of the start circle and save it to the form
              const { x, y } = target.getAbsolutePosition()
              // Save the value to form when ends instead of during dragging
              setValueWithName({
                x1: x / stageWidth,
                y1: y / stageHeight,
                x2: groupAbsoluteEnd.x / stageWidth,
                y2: groupAbsoluteEnd.y / stageHeight,
              })
            }}
            onDragMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
              const target = e.target
              // get the absolute position explictly
              const { x, y } = target.getAbsolutePosition()
              handleDragEvent(x, y, setGroupAbsoluteStart)
              // NOTE: keep the circle relative position always being 0
              target.x(0)
              target.y(0)
            }}
            fill="white"
            stroke="green"
            strokeWidth={3}
            radius={6}
          />
        )}
        {groupAbsoluteEnd && (
          <Circle
            // NOTE: use the relative position inside of the Group
            x={groupAbsoluteEnd.x - groupAbsoluteStart.x}
            y={groupAbsoluteEnd.y - groupAbsoluteStart.y}
            draggable
            onMouseEnter={(e) => updateMouseCursor(e, 'pointer')}
            onDragEnd={(e: Konva.KonvaEventObject<MouseEvent>) => {
              // NOTE: MUST set the cancelBubble on the drag end event
              // eslint-disable-next-line no-param-reassign
              e.cancelBubble = true

              const target = e.target
              // get the absolute position explictly
              const { x, y } = target.getAbsolutePosition()
              // Save the value to form when ends instead of during dragging
              setValueWithName({
                x1: groupAbsoluteStart.x / stageWidth,
                y1: groupAbsoluteStart.y / stageHeight,
                x2: x / stageWidth,
                y2: y / stageHeight,
              })
            }}
            onDragMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
              const target = e.target
              const { x, y } = target.getAbsolutePosition()

              handleDragEvent(x, y, setGroupAbsoluteEnd)
              // NOTE: keep updating the relative position
              target.x(groupAbsoluteEnd.x - groupAbsoluteStart.x)
              target.y(groupAbsoluteEnd.y - groupAbsoluteStart.y)
            }}
            fill="white"
            stroke="green"
            strokeWidth={3}
            radius={6}
          />
        )}
      </Group>
    )
  )
}

export default CrossingLine
