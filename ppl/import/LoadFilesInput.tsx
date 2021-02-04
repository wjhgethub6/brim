import React, {ChangeEvent, MouseEvent} from "react"
import classNames from "classnames"
import useCallbackRef from "src/js/components/hooks/useCallbackRef"
import useDropzone from "src/js/components/hooks/useDropzone"
import ToolbarButton from "app/toolbar/button"
import Folder from "src/js/icons/Folder"
import {reactElementProps} from "src/js/test/integration"
import PcapFileIcon from "./PcapFileIcon"
import ZeekFileIcon from "./ZeekFileIcon"

type Props = {
  onChange: (e, files: File[]) => void
}

export default function LoadFilesInput({onChange}: Props) {
  const [input, setInput] = useCallbackRef<HTMLInputElement>()

  const [bindDropzone, dragging] = useDropzone((e: DragEvent) => {
    const files = Array.from(e.dataTransfer.files)
    onChange(e, files)
  })

  function _onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files)
    onChange(e, files)
  }

  function openDialog(_: MouseEvent) {
    if (input) input.click()
  }

  return (
    <div
      className={classNames("load-files-input", {dragging})}
      {...bindDropzone()}
    >
      <input
        tabIndex={-1}
        ref={setInput}
        type="file"
        multiple
        title=""
        onChange={_onChange}
        {...reactElementProps("ingestFilesInput")}
      />
      <div className="radiation">
        <div />
        <div />
        <div />
      </div>
      <div className="content">
        <div className="controls">
          <ToolbarButton
            text="Choose Files"
            onClick={openDialog}
            {...reactElementProps("ingestFilesButton")}
          />
          <p>Or drag & drop them here.</p>
        </div>
        <div className="file-types">
          <PcapFileIcon />
          <div className="zeek-files-stack">
            <ZeekFileIcon />
            <ZeekFileIcon />
            <ZeekFileIcon />
          </div>
        </div>
      </div>
      <div className="drag-over-content">
        <p>
          <Folder /> Drop to import...
        </p>
      </div>
    </div>
  )
}
