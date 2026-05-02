import { useRef, useState } from 'react'
import { Stage, Layer, Rect, Ellipse, Text, Line, Group } from 'react-konva'
import { useWhiteboard } from '../../hooks/useWhiteboard'
import DrawTools from './DrawTools'

const Canvas = ({ roomId }) => {
  const { shapes, addShape, moveShape, updateShape, deleteShape, clearBoard } = useWhiteboard(roomId)
  const [selectedId, setSelectedId]   = useState(null)
  const [tool, setTool]               = useState('select')
  const [color, setColor]             = useState('#93C5FD')
  const stageRef = useRef()

  const deselect = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null)
  }

  const handleDragEnd = (id, e) => {
    moveShape(id, e.target.x(), e.target.y())
  }

  const handleStageClick = (e) => {
    if (tool === 'select') return
    const pos = stageRef.current.getPointerPosition()
    if (!pos) return

    const kindMap = {
      rect: 'rect', ellipse: 'ellipse',
      text: 'text', sticky: 'sticky', line: 'line'
    }
    const kind = kindMap[tool]
    if (!kind) return

    addShape(kind, {
      x: pos.x, y: pos.y,
      ...(kind === 'rect' || kind === 'sticky' ? { fill: color } : {}),
      ...(kind === 'ellipse' ? { fill: color } : {}),
    })
    setTool('select')
  }

  const renderShape = (shape) => {
    const common = {
      key:        shape.id,
      id:         shape.id,
      x:          shape.x,
      y:          shape.y,
      draggable:  true,
      onClick:    () => setSelectedId(shape.id),
      onDragEnd:  (e) => handleDragEnd(shape.id, e),
      stroke:     selectedId === shape.id ? '#6366F1' : shape.stroke,
      strokeWidth: selectedId === shape.id ? 2 : shape.strokeWidth,
    }

    switch (shape.kind) {
      case 'rect':
        return <Rect {...common} width={shape.width} height={shape.height} fill={shape.fill} cornerRadius={4} />

      case 'ellipse':
        return <Ellipse {...common} radiusX={shape.radiusX} radiusY={shape.radiusY} fill={shape.fill} />

      case 'text':
        return <Text {...common} text={shape.text} fontSize={shape.fontSize}
          fill={shape.fill} width={shape.width}
          onDblClick={() => {
            const newText = window.prompt('Edit text:', shape.text)
            if (newText !== null) updateShape(shape.id, { text: newText })
          }}
        />

      case 'sticky':
        return (
          <Group {...common}>
            <Rect width={shape.width} height={shape.height} fill={shape.fill}
              cornerRadius={4} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />
            <Text text={shape.text} fontSize={13} fill='#1F2937'
              width={shape.width - 16} x={8} y={8} wrap='word'
              onDblClick={() => {
                const t = window.prompt('Edit note:', shape.text)
                if (t !== null) updateShape(shape.id, { text: t })
              }}
            />
          </Group>
        )

      case 'line':
        return <Line {...common} points={shape.points} stroke={shape.stroke ?? '#6B7280'}
          strokeWidth={shape.strokeWidth ?? 2} lineCap='round' />

      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border-tertiary)', borderRadius: 8, overflow: 'hidden' }}>
      <DrawTools
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        onDelete={() => { if (selectedId) { deleteShape(selectedId); setSelectedId(null) } }}
        onClear={clearBoard}
      />
      <Stage
        ref={stageRef}
        width={window.innerWidth - 320}   // account for chat sidebar
        height={420}
        style={{ background: '#FAFAFA', cursor: tool === 'select' ? 'default' : 'crosshair' }}
        onMouseDown={deselect}
        onClick={handleStageClick}
      >
        <Layer>
          {shapes.map(renderShape)}
        </Layer>
      </Stage>
    </div>
  )
}

export default Canvas