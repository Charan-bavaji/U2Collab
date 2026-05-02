const Toolbar = ({ editor }) => {
  if (!editor) return null

  const btn = (label, action, active) => (
    <button
      key={label}
      onMouseDown={e => { e.preventDefault(); action() }}
      style={{
        padding: '4px 10px',
        fontWeight: active ? 600 : 400,
        background: active ? 'var(--color-background-info)' : 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--color-text-primary)',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      display: 'flex', gap: 2, padding: '6px 8px',
      borderBottom: '1px solid var(--color-border-tertiary)',
      background: 'var(--color-background-secondary)',
      flexWrap: 'wrap',
    }}>
      {btn('B',  () => editor.chain().focus().toggleBold().run(),        editor.isActive('bold'))}
      {btn('I',  () => editor.chain().focus().toggleItalic().run(),      editor.isActive('italic'))}
      {btn('S',  () => editor.chain().focus().toggleStrike().run(),      editor.isActive('strike'))}
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('•',  () => editor.chain().focus().toggleBulletList().run(),  editor.isActive('bulletList'))}
      {btn('1.', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {btn('`',  () => editor.chain().focus().toggleCode().run(),        editor.isActive('code'))}
      {btn('—',  () => editor.chain().focus().setHorizontalRule().run(), false)}
      <div style={{ flex: 1 }} />
      {btn('↩ Undo', () => editor.chain().focus().undo().run(), false)}
      {btn('↪ Redo', () => editor.chain().focus().redo().run(), false)}
    </div>
  )
}

export default Toolbar