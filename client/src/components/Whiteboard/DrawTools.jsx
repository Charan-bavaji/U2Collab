const TOOLS = [
  { id: 'select',  label: '↖ Select' },
  { id: 'rect',    label: '▭ Rect' },
  { id: 'ellipse', label: '⬭ Ellipse' },
  { id: 'text',    label: 'T Text' },
  { id: 'sticky',  label: '⬛ Sticky' },
  { id: 'line',    label: '╱ Line' },
]

const COLORS = ['#93C5FD','#86EFAC','#FDE68A','#FCA5A5','#C4B5FD','#F9A8D4','#6B7280','#1F2937']

const DrawTools = ({ tool, setTool, color, setColor, onDelete, onClear }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', flexWrap: 'wrap',
    borderBottom: '1px solid var(--color-border-tertiary)',
    background: 'var(--color-background-secondary)',
  }}>
    {TOOLS.map(t => (
      <button key={t.id} onClick={() => setTool(t.id)} style={{
        padding: '3px 10px', fontSize: 12, borderRadius: 4, cursor: 'pointer',
        border: tool === t.id ? '1.5px solid #6366F1' : '1px solid var(--color-border-secondary)',
        background: tool === t.id ? '#EEF2FF' : 'transparent',
        color: 'var(--color-text-primary)',
        fontWeight: tool === t.id ? 500 : 400,
      }}>
        {t.label}
      </button>
    ))}

    <div style={{ width: 1, height: 20, background: 'var(--color-border-tertiary)', margin: '0 4px' }} />

    {COLORS.map(c => (
      <div key={c} onClick={() => setColor(c)} style={{
        width: 18, height: 18, borderRadius: '50%', background: c,
        cursor: 'pointer', flexShrink: 0,
        border: color === c ? '2px solid #6366F1' : '1.5px solid transparent',
        boxSizing: 'border-box',
      }} />
    ))}

    <div style={{ flex: 1 }} />

    <button onClick={onDelete} style={{
      padding: '3px 10px', fontSize: 12, borderRadius: 4,
      border: '1px solid var(--color-border-secondary)',
      background: 'transparent', cursor: 'pointer',
      color: 'var(--color-text-danger)',
    }}>
      Delete
    </button>
    <button onClick={() => { if (window.confirm('Clear the entire board?')) onClear() }}
      style={{
        padding: '3px 10px', fontSize: 12, borderRadius: 4,
        border: '1px solid var(--color-border-secondary)',
        background: 'transparent', cursor: 'pointer',
        color: 'var(--color-text-secondary)',
      }}>
      Clear
    </button>
  </div>
)

export default DrawTools