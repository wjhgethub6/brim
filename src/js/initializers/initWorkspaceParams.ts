import {Store} from "../state/types"
import Workspaces from "../state/Workspaces"
import Current from "../state/Current"
import getUrlSearchParams from "../lib/getUrlSearchParams"
import {Workspace} from "../state/Workspaces/types"

const setupDefaultWorkspace = () => (dispatch, _, {globalDispatch}) => {
  const host = "localhost"
  const port = "9867"
  const hostPort = [host, port].join(":")
  const ws: Workspace = {
    host,
    port,
    id: hostPort,
    name: hostPort
  }
  dispatch(Workspaces.add(ws))
  globalDispatch(Workspaces.add(ws))
  dispatch(Current.setWorkspaceId(ws.id))
}

export default function(store: Store) {
  const {id} = getUrlSearchParams()
  global.windowId = id

  const existingWorkspace = Current.getWorkspace(store.getState())

  if (!existingWorkspace) {
    store.dispatch(setupDefaultWorkspace())
  }
}
