import type { SdfFilterState } from 'open-glass-ui'

// Isolate one channel of a displaced copy, so each can be shifted by a
// slightly different amount (chromatic dispersion), then recombined.
const RED_ONLY = '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
const GREEN_ONLY = '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'
const BLUE_ONLY = '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'

interface BackdropRefractionFilterProps {
  filter: SdfFilterState
  width: number
  height: number
  /** Multiplier on OpenGlass's displacement scales. */
  strength?: number
  /** Gaussian frost applied to the backdrop before it is refracted. */
  frost?: number
}

/**
 * OpenGlass's SVG lens filter, rebuilt for `backdrop-filter`.
 *
 * `<Glass>` applies its SDF filter with `filter:`, which bends the element's
 * own contents. A navbar needs the page *behind* it to bend, so this renders
 * the same chain (OpenGlass's displacement map, per-channel dispersion and
 * specular layer) in pixel space sized to the element, to be referenced from
 * `backdrop-filter: url(#id)`.
 */
export function BackdropRefractionFilter({
  filter,
  width,
  height,
  strength = 1,
  frost = 0.5,
}: BackdropRefractionFilterProps) {
  const spec = filter.spec
  if (!spec || width === 0 || height === 0) return null

  const channels = [
    { name: 'RED', scale: spec.redScale, matrix: RED_ONLY },
    { name: 'GREEN', scale: spec.greenScale, matrix: GREEN_ONLY },
    { name: 'BLUE', scale: spec.blueScale, matrix: BLUE_ONLY },
  ]

  return (
    <svg aria-hidden focusable="false" width="0" height="0" className="absolute">
      <defs>
        <filter
          id={filter.filterId}
          x="0"
          y="0"
          width={width}
          height={height}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={frost}
            edgeMode="duplicate"
            result="SOURCE"
          />
          <feImage
            href={spec.href}
            x="0"
            y="0"
            width={width}
            height={height}
            preserveAspectRatio="none"
            result="MAP"
          />
          {channels.map(({ name, scale, matrix }) => [
            <feDisplacementMap
              key={`${name}-shift`}
              in="SOURCE"
              in2="MAP"
              // Negative: the map points the rim outward, but a backdrop has no
              // pixels beyond the element, so sample inward instead.
              scale={-scale * strength}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`${name}_SHIFT`}
            />,
            <feColorMatrix
              key={`${name}-only`}
              in={`${name}_SHIFT`}
              type="matrix"
              values={matrix}
              result={name}
            />,
          ])}
          <feBlend in="RED" in2="GREEN" mode="screen" result="RG" />
          <feBlend in="RG" in2="BLUE" mode="screen" result="RGB" />
          {/* OpenGlass's specular layer: the map's blue channel as a bright rim. */}
          <feColorMatrix
            in="MAP"
            type="matrix"
            values={`0 0 1 0 0  0 0 1 0 0  0 0 1 0 0  0 0 ${spec.specularOpacity} 0 0`}
            result="SPECULAR"
          />
          <feComposite in="SPECULAR" in2="SOURCE" operator="in" result="SPEC" />
          <feBlend in="RGB" in2="SPEC" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}
