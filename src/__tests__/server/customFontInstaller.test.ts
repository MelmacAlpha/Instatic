import { describe, expect, it } from 'bun:test'
import { assembleCustomFontEntry } from '../../../server/fonts/googleFontsInstaller'

describe('assembleCustomFontEntry', () => {
  it('keeps static variants and variable weight ranges in one custom entry', () => {
    const entry = assembleCustomFontEntry({
      family: 'Acme Sans',
      files: [
        {
          variant: '400',
          format: 'woff2',
          path: '/uploads/media/acme-regular.woff2',
          mediaAssetId: 'regular',
        },
        {
          variable: true,
          weightMin: 100,
          weightMax: 900,
          format: 'woff2',
          path: '/uploads/media/acme-variable.woff2',
          mediaAssetId: 'variable',
        },
      ],
    })

    expect(entry.variants).toEqual(['400'])
    expect(entry.files).toHaveLength(2)
    expect(entry.files[1]).toMatchObject({
      variable: true,
      weightMin: 100,
      weightMax: 900,
    })
  })
})
