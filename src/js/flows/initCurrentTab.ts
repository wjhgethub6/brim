import Current from "../state/Current"
import {initSpace} from "./initSpace"
import {Thunk} from "../state/types"
import {initWorkspace} from "./initWorkspace"

export const initCurrentTab = (): Thunk => async (dispatch, getState) => {
  const state = getState()
  const ws = Current.getWorkspace(state)
  const spaceId = Current.getSpaceId(state)

  try {
    await dispatch(initWorkspace(ws.serialize()))
    if (spaceId) {
      dispatch(initSpace(spaceId))
    }
  } catch (e) {
    console.error("Workspace connection failed: ", e)
  }
}
