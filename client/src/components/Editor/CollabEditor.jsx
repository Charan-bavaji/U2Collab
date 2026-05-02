import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { useYjs } from '../../hooks/useYjs'
import Toolbar from './Toolbar'

const CollabEditor = ({ roomId }) => {
  const doc    = useYjs(roomId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),  // Yjs handles undo/redo
      Collaboration.configure({ document: doc }),
    ],
    editorProps: {
      attributes: { class: 'collab-editor' }
    }
  })

  return (
    <div style={{ border: '1px solid var(--color-border-tertiary)', borderRadius: 8, overflow: 'hidden' }}>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        style={{ padding: '1rem', minHeight: 320, outline: 'none' }}
      />
    </div>
  )
}

export default CollabEditor