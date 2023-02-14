import {  useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import useLineCrossingImage from "./useLineCrossingImage";
import CrossingLine from "./CrossingLine";
import { DEFAULT_WIDTH_HEIGHT } from "./utils";
import { ImageLineCrossingFormType } from "./types";

const ImageLineCrossing = ({ imgSrc }: { imgSrc: string }) => {
  const initValue = {
    x1: 0.2,
    y1: 0.2,
    x2: 0.8,
    y2: 0.8,
  };
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [startPoint, setStartPoint] = useState<Vector2d | null>(null);
  const [endPoint, setEndPoint] = useState<Vector2d | null>(null);

  const [value , setValue] = useState<ImageLineCrossingFormType>()

  const [isDuringNewLine, setIsDuringNewLine] = useState<boolean>(false);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e?.target;

    // Draw a new line again if click on the image not the Group
    if (target.getClassName() === "Image") {
      const stage = target?.getStage();
      if (stage && stage.getPointerPosition()) {
        setIsDuringNewLine(true);
        setStartPoint(stage.getPointerPosition());
        // remove previous end point when start a new line
        setEndPoint(null);
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e?.target;
    // NOTE: finish the line only when the target is image
    if (target.getClassName() === "Image" && isDuringNewLine) {
      const stage = target?.getStage();
      if (stage && stage.getPointerPosition()) {
        const endValue = stage.getPointerPosition();
        setIsDuringNewLine(false);
        setEndPoint(endValue);
        // save the value to the form
        console.log({
          x1: (startPoint?.x ?? 0) / stageWidth,
          y1: (startPoint?.y ?? 0) / imgHeight,
          x2: (endValue?.x ?? DEFAULT_WIDTH_HEIGHT) / stageWidth,
          y2: (endValue?.y ?? DEFAULT_WIDTH_HEIGHT) / imgHeight,
        });
      }
    }
  };

  // calculate the width of parent's node as canvas's width
  const stageWidth = stageRef?.current?.offsetWidth || DEFAULT_WIDTH_HEIGHT;

  // with given width, calculate the related height without changing ratio of image
  // and get the image canvas instance
  const { imgHeight, instance: ImgInstance } = useLineCrossingImage({
    imgSrc,
    width: stageWidth,
  });

  useEffect(() => {
    setStartPoint({
      x: initValue.x1 * stageWidth,
      y: initValue.y1 * imgHeight,
    });
    setEndPoint({ x: initValue.x2 * stageWidth, y: initValue.y2 * imgHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageWidth, imgHeight]);

  return (
    <div
      ref={stageRef}
      style={{
        width: '100%',
        height: '100%',
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Stage
        width={stageWidth}
        height={imgHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {ImgInstance}
          <CrossingLine
            stageWidth={stageWidth}
            stageHeight={imgHeight}
            start={startPoint}
            end={endPoint}
            setStartPoint={setStartPoint}
            setEndPoint={setEndPoint}
            setValueWithName={setValue}
          />
        </Layer>
      </Stage>
      <div>{JSON.stringify(value)}</div>
    </div>
  );
};

export default ImageLineCrossing;
