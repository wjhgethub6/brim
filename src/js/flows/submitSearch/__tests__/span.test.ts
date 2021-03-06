import {createZealotMock} from "zealot"

import {submitSearch} from "../mod"
import Current from "../../../state/Current"
import Search from "../../../state/Search"
import SearchBar from "../../../state/SearchBar"
import Spaces from "../../../state/Spaces"
import Tab from "../../../state/Tab"
import brim from "../../../brim"
import fixtures from "../../../test/fixtures"
import responses from "../../../test/responses"
import initTestStore from "../../../test/initTestStore"
import Workspaces from "../../../state/Workspaces"

const dnsResp = responses("dns.txt")
const countByPathResp = responses("count_by_path.txt")
const space = fixtures("space1")

let store, zealot, dispatch, select
beforeEach(() => {
  zealot = createZealotMock()
  store = initTestStore(zealot.zealot)
  dispatch = store.dispatch
  select = (s: any) => s(store.getState())
  zealot.stubStream("search", countByPathResp).stubStream("search", dnsResp)
  store.dispatchAll([
    Workspaces.add({
      host: "testHost",
      id: "1",
      name: "testName",
      port: "9867"
    }),
    Current.setWorkspaceId("1"),
    Spaces.setDetail("1", space),
    Current.setSpaceId(space.id),
    SearchBar.changeSearchBarInput("dns"),
    SearchBar.pinSearchBar(),
    SearchBar.changeSearchBarInput("query")
  ])
})
const submit = (...args) => dispatch(submitSearch(...args))

test("Computes the span", async () => {
  expect(select(Tab.getSpan)).toEqual([
    {sec: 0, ns: 0},
    {sec: 1, ns: 0}
  ])
  const now = new Date(2020, 4, 21, 12, 5, 0, 0)
  await submit(undefined, now)
  expect(select(Tab.getSpan)).toEqual([
    {ns: 0, sec: 1590087600},
    {ns: 0, sec: 1590087900}
  ])
})

test("a zoomed search", async () => {
  const zoom = brim.time.convertToSpan([new Date(0), new Date(1)])
  dispatch(Search.setSpanFocus(zoom))
  const spy = jest.spyOn(zealot.zealot, "search")
  await submit()
  expect(spy.mock.calls[0]).toEqual([
    expect.any(String),
    expect.objectContaining({
      from: new Date("1970-01-01T00:00:00.000Z"),
      to: new Date("1970-01-01T00:00:00.001Z")
    })
  ])
})
