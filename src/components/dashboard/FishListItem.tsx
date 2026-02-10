type Props = {
  name: string
  count: number
  tankName: string
  imageUrl?: string
  onClick?: () => void
}

export default function FishListItem({ name, count, tankName, imageUrl, onClick }: Props) {
  const initials = name
    ? name.split(" ").slice(0, 2).map(part => part[0]).join("").toUpperCase()
    : "?"

  return (
    <div 
      className="list-item" 
      onClick={onClick}
      style={{ 
        cursor: onClick ? "pointer" : "default",
        transition: "all var(--transition-fast)"
      }}
      onMouseEnter={onClick ? (e) => { 
        e.currentTarget.style.background = "var(--surface-3)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--elevation-2)";
      } : undefined}
      onMouseLeave={onClick ? (e) => { 
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      } : undefined}
    >
      <div className="list-item-media">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="list-item-image" />
        ) : (
          <div className="list-item-avatar">{initials}</div>
        )}
      </div>
      <div className="list-item-content">
        <div className="list-item-title">{name}</div>
        <div className="list-item-subtitle">
          ×{count} <span className="meta-text-separator">·</span> {tankName}
        </div>
      </div>
    </div>
  )
}
