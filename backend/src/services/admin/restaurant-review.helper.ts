type DiffRemovedPublishedImagesParams = {
  publishedImages: {
    publicId: string
  }[]

  draftImages: {
    publicId: string
    sourceType: string
  }[]
}

export function diffRemovedPublishedImages({
  publishedImages,
  draftImages,
}: DiffRemovedPublishedImagesParams) {

  const remainingPublishedPublicIds = new Set(
    draftImages
      .filter(img => img.sourceType === 'PUBLISHED')
      .map(img => img.publicId)
  )

  return publishedImages.filter(
    img => !remainingPublishedPublicIds.has(img.publicId)
  )
}