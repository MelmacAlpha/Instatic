import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { FontEntry } from '@core/fonts'
import { StyleSectionsEditor } from '@site/panels/PropertiesPanel/StyleSectionsEditor'
import { FontWeightControl } from '../../admin/pages/site/property-controls/FontWeightControl'
import { setEditorPreference } from '@site/preferences/editorPreferences'
import { useEditorStore } from '@site/store/store'
import { makeSite } from '../fixtures'

const inter: FontEntry = {
  id: 'font-inter',
  source: 'google',
  family: 'Inter',
  variants: ['300', '400', '700', '900'],
  subsets: ['latin'],
  files: [
    { variant: '300', subset: 'latin', path: '/uploads/fonts/inter/300-latin.woff2', format: 'woff2' },
    { variant: '400', subset: 'latin', path: '/uploads/fonts/inter/400-latin.woff2', format: 'woff2' },
    { variant: '700', subset: 'latin', path: '/uploads/fonts/inter/700-latin.woff2', format: 'woff2' },
    { variant: '900', subset: 'latin', path: '/uploads/fonts/inter/900-latin.woff2', format: 'woff2' },
  ],
  category: 'Sans Serif',
  createdAt: 1,
  updatedAt: 1,
}

const interVariable: FontEntry = {
  id: 'font-inter-variable',
  source: 'custom',
  family: 'Inter Variable',
  variants: [],
  subsets: ['latin'],
  files: [{
    variable: true,
    weightMin: 100,
    weightMax: 900,
    subset: 'latin',
    path: '/uploads/media/inter-variable.woff2',
    format: 'woff2',
  }],
  createdAt: 1,
  updatedAt: 1,
}

beforeEach(() => {
  setEditorPreference('propertiesSectionsExpanded', true)
  useEditorStore.setState({
    site: makeSite({
      settings: {
        shortcuts: {},
        fonts: {
          items: [inter],
          tokens: [
            {
              id: 'token-primary',
              name: 'Primary',
              variable: 'font-primary',
              familyId: inter.id,
              fallback: 'sans-serif',
              order: 0,
              createdAt: 1,
              updatedAt: 1,
            },
          ],
        },
      },
    }),
  } as Parameters<typeof useEditorStore.setState>[0])
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('font weight style options', () => {
  it('reflects the installed variants for the active font token', () => {
    renderFontWeightRow({ fontFamily: 'var(--font-primary)' })

    expect(fontWeightOptionValues()).toEqual(['', '300', '400', '700', '900'])
  })

  it('uses the default body font token when no explicit font family is set', () => {
    renderFontWeightRow({})

    expect(fontWeightOptionValues()).toEqual(['', '300', '400', '700', '900'])
  })

  it('uses a numeric range input for a variable font', () => {
    useEditorStore.setState({
      site: makeSite({
        settings: {
          shortcuts: {},
          fonts: {
            items: [interVariable],
            tokens: [{
              id: 'token-variable',
              name: 'Variable',
              variable: 'font-variable',
              familyId: interVariable.id,
              fallback: 'sans-serif',
              order: 0,
              createdAt: 1,
              updatedAt: 1,
            }],
          },
        },
      }),
    } as Parameters<typeof useEditorStore.setState>[0])

    renderFontWeightRow({ fontFamily: 'var(--font-variable)' })

    const row = screen.getByTestId('css-property-row-fontWeight')
    const input = row.querySelector('input[type="text"]')
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input?.getAttribute('min')).toBe('100')
    expect(input?.getAttribute('max')).toBe('900')
    expect(input?.getAttribute('step')).toBe('50')
    expect(input?.getAttribute('inputmode')).toBe('numeric')
    expect(row.querySelector('select')).toBeNull()
  })
})

describe('FontWeightControl editing', () => {
  it('accepts CSS variable values and commits them when editing ends', () => {
    const changes: string[] = []

    render(
      <FontWeightControl
        propKey="fontWeight"
        value="400"
        label="Font weight"
        min={100}
        max={900}
        onChange={(_key, nextValue) => changes.push(nextValue)}
      />,
    )

    const input = screen.getByLabelText('Font weight')
    fireEvent.focus(input)
    fireEvent.input(input, { target: { value: 'var(--heading-font-weight)' } })

    expect((input as HTMLInputElement).value).toBe('var(--heading-font-weight)')
    expect(changes).toEqual([])

    fireEvent.blur(input)

    expect(changes).toEqual(['var(--heading-font-weight)'])
  })

  it('keeps spinner edits local until the input loses focus', () => {
    const changes: string[] = []

    render(
      <FontWeightControl
        propKey="fontWeight"
        value="400"
        label="Font weight"
        min={100}
        max={900}
        onChange={(_key, nextValue) => changes.push(nextValue)}
      />,
    )

    const input = screen.getByLabelText('Font weight')
    const increase = document.querySelector('button[aria-label="Increase"]')
    if (!(increase instanceof HTMLButtonElement)) {
      throw new Error('Expected a font-weight spinner')
    }

    fireEvent.click(increase)
    fireEvent.click(increase)

    expect((input as HTMLInputElement).value).toBe('500')
    expect(changes).toEqual([])

    fireEvent.blur(input)

    expect(changes).toEqual(['500'])
  })
})

function renderFontWeightRow(styles: Record<string, unknown>): void {
  render(
    <StyleSectionsEditor
      storedStyles={styles}
      currentStyles={styles}
      sectionKey="base"
      styleQuery="font weight"
      onChange={() => {}}
      onRemove={() => {}}
      onClearProperty={() => {}}
      onClearProperties={() => {}}
      onPreview={() => {}}
      onClearPreview={() => {}}
    />,
  )
}

function fontWeightOptionValues(): string[] {
  const row = screen.getByTestId('css-property-row-fontWeight')
  const select = row.querySelector('select')
  expect(select).toBeInstanceOf(HTMLSelectElement)

  return Array.from(select?.options ?? [], (option) => option.value)
}
