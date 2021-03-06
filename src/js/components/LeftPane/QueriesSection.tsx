import {Group, Query} from "../../state/Queries/types"
import TreeModel from "tree-model"
import {includes} from "lodash"
import {useDispatch, useSelector} from "react-redux"
import React, {useEffect, useState} from "react"
import Current from "../../state/Current"
import Queries from "../../state/Queries"
import SearchBar from "../../state/SearchBar"
import {submitSearch} from "../../flows/submitSearch/mod"
import {MenuItemConstructorOptions, remote} from "electron"
import lib from "../../lib"
import {popNotice} from "../PopNotice"
import Modal from "../../state/Modal"
import usePopupMenu from "../hooks/usePopupMenu"
import Notice from "../../state/Notice"
import {TreeList} from "../../../pkg/tree-list"
import Item from "../SideBar/Item"
import EmptySection from "../common/EmptySection"
import DropdownArrow from "../../icons/DropdownArrow"
import {
  ClickRegion,
  DragAnchor,
  SectionContents,
  SectionHeader,
  StyledArrow,
  StyledSection,
  StyledViewSelect,
  Title
} from "./common"
import {globalDispatch} from "../../state/GlobalContext"

const filterQueriesByTag = (queriesRoot: Group, tag: string): Query[] => {
  const queryResults = []
  new TreeModel({childrenPropertyName: "items"})
    .parse(queriesRoot)
    .walk((n) => {
      if (!n.model.tags) return true
      if (includes(n.model.tags, tag)) queryResults.push(n.model)

      return true
    })

  return queryResults
}

const TagsViewSelect = ({selected, tags, onSelect}) => {
  const template = tags.map((t) => ({
    label: t,
    click: () => onSelect(t),
    type: "checkbox",
    checked: selected === t
  }))

  template.unshift(
    ...[
      {
        label: "Filter by tag",
        enabled: false
      },
      {type: "separator"}
    ]
  )

  const menu = usePopupMenu(template)

  return (
    <StyledViewSelect onClick={menu.onClick}>
      {selected}
      <DropdownArrow />
    </StyledViewSelect>
  )
}

function QueriesSection({isOpen, style, resizeProps, toggleProps}) {
  const dispatch = useDispatch()
  const [contextArgs, setContextArgs] = useState(null)
  const [selectedTag, setSelectedTag] = useState("All")
  const currentSpace = useSelector(Current.getSpace)
  const queriesRoot = useSelector(Queries.getRaw)
  const [queries, setQueries] = useState(queriesRoot)
  const tags = useSelector(Queries.getTags)
  const hasMultiSelected = contextArgs && contextArgs.selections.length > 1

  useEffect(() => {
    setQueries(queriesRoot)
  }, [queriesRoot])

  const runQuery = (value) => {
    dispatch(SearchBar.clearSearchBar())
    dispatch(SearchBar.changeSearchBarInput(value))
    dispatch(submitSearch())
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: "Run Query",
      enabled: !hasMultiSelected && !!currentSpace,
      click: () => {
        const {
          item: {value}
        } = contextArgs

        runQuery(value)
      }
    },
    {
      label: "Copy Query",
      enabled: !hasMultiSelected,
      click: () => {
        const {
          item: {value}
        } = contextArgs
        lib.doc.copyToClipboard(value)
        popNotice("Query copied to clipboard")
      }
    },
    {type: "separator"},
    {
      label: "Edit",
      enabled: !hasMultiSelected,
      click: () => {
        const {item} = contextArgs
        // only edit queries
        if ("items" in item) return
        dispatch(Modal.show("edit-query", {query: item}))
      }
    },
    {type: "separator"},
    {
      label: hasMultiSelected ? "Delete Selected" : "Delete",
      click: () => {
        return remote.dialog
          .showMessageBox({
            type: "warning",
            title: "Confirm Delete Query Window",
            message: `Are you sure you want to delete the ${(contextArgs.selections &&
              contextArgs.selections.length) ||
              ""} selected quer${hasMultiSelected ? "ies" : "y"}?`,
            buttons: ["OK", "Cancel"]
          })
          .then(({response}) => {
            if (response === 0) {
              const {selections, item} = contextArgs
              if (hasMultiSelected)
                globalDispatch(Queries.removeItems(selections))
              else globalDispatch(Queries.removeItems([item]))
            }
          })
      }
    }
  ]

  const menu = usePopupMenu(template)

  function onItemClick(_, item) {
    if (!currentSpace)
      return dispatch(Notice.set(new Error("No space selected")))

    if (!item.value) return

    runQuery(item.value)
  }

  function onItemMove(sourceItem, destIndex) {
    if (selectedTag !== "All") return
    globalDispatch(Queries.moveItems([sourceItem], queriesRoot, destIndex))
  }

  function onItemContextMenu(_, item, selections) {
    setContextArgs({item, selections})
  }

  function onTagSelect(tag) {
    setSelectedTag(tag)
    if (tag === "All") {
      setQueries(queriesRoot)
      return
    }
    setQueries({
      id: "root",
      name: "root",
      items: filterQueriesByTag(queriesRoot, tag)
    })
  }

  // trigger menu open after contextArgs have updated so it renders with fresh data
  useEffect(() => {
    if (!contextArgs) return
    menu.open()
  }, [contextArgs])

  return (
    <StyledSection style={style}>
      <DragAnchor {...resizeProps} />
      <SectionHeader>
        <ClickRegion {...toggleProps}>
          <StyledArrow show={isOpen} />
          <Title>Queries</Title>
        </ClickRegion>
        {currentSpace && (
          <TagsViewSelect
            selected={selectedTag}
            tags={["All", ...tags]}
            onSelect={onTagSelect}
          />
        )}
      </SectionHeader>
      <SectionContents>
        {currentSpace ? (
          <TreeList
            root={queries}
            itemHeight={24}
            onItemMove={onItemMove}
            onItemClick={onItemClick}
            onItemContextMenu={onItemContextMenu}
          >
            {Item}
          </TreeList>
        ) : (
          <EmptySection message="You must have a space selected to run queries." />
        )}
      </SectionContents>
    </StyledSection>
  )
}

export default QueriesSection
