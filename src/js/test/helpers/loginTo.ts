import {createZealotMock, ZealotMock} from "zealot"

import {initSpace} from "../../flows/initSpace"
import Workspaces from "../../state/Workspaces"
import Current from "../../state/Current"
import Spaces from "../../state/Spaces"
import fixtures from "../fixtures"
import initTestStore, {TestStore} from "../initTestStore"
import {Workspace} from "../../state/Workspaces/types"

export default async function loginTo(
  workspaceName: string,
  spaceName: string
): Promise<{store: TestStore; workspace: Workspace; zealot: ZealotMock}> {
  const mock = createZealotMock()
  mock
    .stubPromise("version", {version: "1"}, "always")
    .stubPromise("spaces.list", [{name: "dataSpace", id: "1"}], "always")
    .stubPromise("spaces.get", {name: "dataSpace", id: "1"}, "always")
    .stubStream(
      "search",
      [
        {type: "TaskStart", task_id: 1},
        {type: "TaskEnd", task_id: 1}
      ],
      "always"
    )
  const store = initTestStore(mock.zealot)
  const workspace = fixtures(workspaceName)
  const space = fixtures(spaceName)

  store.dispatch(Workspaces.add(workspace))
  store.dispatch(Current.setWorkspaceId(workspace.id))
  store.dispatch(Spaces.setDetail(workspace.id, space))
  return store.dispatch(initSpace(space.name)).then(() => {
    return {store, workspace, zealot: mock}
  })
}
