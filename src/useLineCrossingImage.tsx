import { useEffect, useState } from 'react'
import { Image, Group } from 'react-konva'
import { DEFAULT_WIDTH_HEIGHT, updateMouseCursor } from './utils'

const useLineCrossingImage = ({ imgSrc, width }: { imgSrc: string; width: number }) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>()
  const [imgHeight, setImgHeight] = useState<number>(DEFAULT_WIDTH_HEIGHT) // FIXME: need to make sure it would get the correct height

  // load image with given base64 string src
  useEffect(() => {
    const imageInstance: HTMLImageElement = new window.Image()
    const updateImage = () => {
      // calculate the related height with width and not changing ratio
      const height = (width / imageInstance.width) * imageInstance.height
      imageInstance.width = width
      imageInstance.height = height
      setImgHeight(height)
      setImage(imageInstance)
    }
    imageInstance.src = imgSrc
    imageInstance.style.width = width + 'px'
    imageInstance.addEventListener('load', updateImage)
    return () => {
      imageInstance.removeEventListener('load', updateImage)
    }
  }, [imgSrc, width])

  return {
    imgHeight,
    instance: (
      <Group>
        <Image
          image={image}
          onMouseEnter={(e) => updateMouseCursor(e, 'crosshair')}
        />
      </Group>
    ),
  }
}

export default useLineCrossingImage
