interface BreadcrumbProps {
  items: string[]
  onNavigate?: (index: number) => void
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item} className="breadcrumb__segment">
            {isLast ? (
              <span className="breadcrumb__current" aria-current="page">
                {item}
              </span>
            ) : (
              <button
                type="button"
                className="breadcrumb__link"
                onClick={() => onNavigate?.(index)}
              >
                {item}
              </button>
            )}
            {!isLast && (
              <span className="breadcrumb__separator" aria-hidden="true">
                ›
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
