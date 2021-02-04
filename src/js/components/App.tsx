import {useSelector} from "react-redux"
import React, {useEffect} from "react"

import {ipcRenderer} from "electron"

import {XLatestError} from "./LatestError"
import AboutModal from "./AboutModal"
import ErrorNotice from "./ErrorNotice"
import HTMLContextMenu from "./HTMLContextMenu"
import Preferences from "./Preferences/Preferences"
import Prefs from "../state/Prefs"
import SpaceModal from "./SpaceModal"
import View from "../state/View"
import brim from "../brim"
import SearchPage from "./SearchPage"
import {PopNotice} from "./PopNotice"
import {Modals} from "./Modals"
import BrimToaster from "./BrimToaster"
import BrimTooltip from "./BrimTooltip"
import HookLog from "app/system-test/HookLog"
import ColumnsModal from "app/columns/columns-modal"

export default function App() {
  brim.time.setZone(useSelector(View.getTimeZone))
  brim.time.setDefaultFormat(useSelector(Prefs.getTimeFormat))

  useEffect(() => {
    ipcRenderer.invoke("windows:ready")
  }, [])

  return (
    <div className="app-wrapper">
      <div className="title-bar-drag-area" />
      <XLatestError />
      <SearchPage />

      {/* Global Modals */}
      <ErrorNotice />
      <Preferences />
      <Modals />
      <AboutModal />
      <SpaceModal />
      <ColumnsModal />
      <HTMLContextMenu />
      <BrimToaster />
      <PopNotice />
      <BrimTooltip />
      {process.env.BRIM_ITEST === "true" && <HookLog />}
    </div>
  )
}
