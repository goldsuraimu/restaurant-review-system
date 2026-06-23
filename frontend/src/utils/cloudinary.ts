const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

function buildUrl(
  publicId: string,
  transformations = ''
) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`
}

export function getThumbnailUrl(
  publicId: string
) {
  return buildUrl(
    publicId,
    'w_160,h_160,c_fill,f_auto,q_auto'
  )
}

export function getViewerUrl(
  publicId: string
) {
  return buildUrl(
    publicId,
    'w_1200,f_auto,q_auto'
  )
}

export function getCoverUrl(
  publicId: string
) {
  return buildUrl(
    publicId,
    'w_800,f_auto,q_auto'
  )
}