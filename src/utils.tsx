import { KonvaEventObject } from "konva/lib/Node"

export const limitValue = (xValue: number, maxValue: number, minValue = 0) =>
  Math.max(minValue, Math.min(maxValue, xValue))

export const updateMouseCursor = (e: KonvaEventObject<MouseEvent>, cursor: string) => {
  const target = e.target
  const stage = target.getStage()
  if (stage?.container()) stage.container().style.cursor = cursor
}

export const DEFAULT_WIDTH_HEIGHT = 400