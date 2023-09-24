'use client'
import { sampleJson } from './assets/sample'
import './assets/css/json-viewer-editor.css'
import './JsonViewerEditor.css'
import JsonViewerToolBar from './json-viewer-tool-bar/JsonViewerToolBar'

export type JsonViewerEditorProps = {
  currentText: string
  isDefaultText: boolean
  updateText: (s: string) => void
  handleCopy: (s: string) => void
  parseJson: (text: string) => any
}

function JsonViewerEditor({
  currentText,
  isDefaultText,
  updateText,
  handleCopy,
  parseJson,
}: JsonViewerEditorProps) {
  const clearDefaultText = () => {
    if (isDefaultText) {
      updateText('')
    }
  }

  const formatJson = (text: string) => {
    const parsedJson = parseJson(text)
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null, 2)
      updateText(formattedJsonString)
    }
  }

  const minimizeJson = (text: string) => {
    const parsedJson = parseJson(text)
    if (parsedJson) {
      const formattedJsonString = JSON.stringify(parsedJson, null)
      updateText(formattedJsonString)
    }
  }

  function renderToolBar() {
    const options = [
      {
        label: 'Copy',
        onClick: () => handleCopy(currentText),
      },
      {
        label: 'Paste',
        onClick: () =>
          navigator.clipboard.readText().then((text) => updateText(text)),
      },
      {
        label: 'Format',
        onClick: () => formatJson(currentText),
      },
      {
        label: 'Minimize',
        onClick: () => minimizeJson(currentText),
      },
      {
        label: 'Clear',
        onClick: () => updateText(''),
      },
      {
        label: 'Example',
        onClick: () => updateText(JSON.stringify(sampleJson)),
      },
    ]
    return <JsonViewerToolBar options={options} />
  }

  return (
    <div className="JsonViewerEditor">
      {renderToolBar()}
      <textarea
        className="main-textarea"
        value={currentText}
        onClick={clearDefaultText}
        onChange={(e) => updateText(e.target.value)}
      ></textarea>
    </div>
  )
}

export default JsonViewerEditor
