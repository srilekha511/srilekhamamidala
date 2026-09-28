export function quantize(v, levels) {
  const step = 255 / (levels - 1)
  return Math.round(Math.round(v / step) * step)
}

export function quantizeImageData(data, levels) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = quantize(data[i], levels)
    data[i + 1] = quantize(data[i + 1], levels)
    data[i + 2] = quantize(data[i + 2], levels)
  }
}

function defaultLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const cache = new Map()

// Cover-fits an image into w×h, downsampled and colour-quantised. Resolves null on failure.
export function loadPixelated(src, w, h, { levels = 6, loadImage = defaultLoadImage } = {}) {
  const key = `${src}|${w}x${h}`
  if (!cache.has(key)) {
    cache.set(
      key,
      loadImage(src)
        .then((img) => {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const c = canvas.getContext('2d')
          const s = Math.max(w / img.width, h / img.height)
          c.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s)
          const data = c.getImageData(0, 0, w, h)
          quantizeImageData(data.data, levels)
          c.putImageData(data, 0, 0)
          return canvas
        })
        .catch(() => null),
    )
  }
  return cache.get(key)
}
