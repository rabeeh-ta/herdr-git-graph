# A Graph button in the top bar

Herdr's main layout has a **Files** and a **Changes** button at the right end of
the tab bar, each opening a side panel. These steps add **Graph** beside them,
opening `git-graph` in the same panel. They are written for the person's agent
to follow; a person can follow them too.

Herdr's own layouts and mods are read-only (they're replaced on every start), so
the button goes into *clones* of the `main` layout and the `tabs` mod. This mod
doesn't ship those clones: they'd be frozen copies of Herdr's code. You make
them from the version you have now.

What clones cost: they're yours and never updated. When a Herdr release changes
the tab bar or the main layout, the clones keep the old ones until you clone
again and redo these steps.

## 1. Clone the tab bar and the layout

```sh
herdr-app do mod.clone '{"name":"tabs","as":"tabs-graph"}'
herdr-app do layout.clone '{"name":"main","as":"main-graph"}'
```

`layout.clone` switches the window to the clone.

## 2. Add the button: `mods/tabs-graph/main.js`

Two edits. In Herdr 0.1.9 the lines read as below; in another version, find the
same two places (the list of enabled panels, and the Changes button).

The enabled panels decide which buttons show and which panel a space may
reopen. Add `"graph"` to them:

```js
// before
const enabled = shared("workspace.panels") ?? ["files", "changes"];
// after
const enabled = [...(shared("workspace.panels") ?? ["files", "changes"]), "graph"];
```

Then add the button right after the Changes one:

```js
      .when(enabled.includes("changes"), el => el.child(panelButton("changes", "Changes", "mods/changes/changes.svg")))
      .child(panelButton("graph", "Graph", "mods/git-graph/icons/graph.svg"))
```

## 3. Add the panel: `layouts/main-graph.json`

- The node with `"id": "tabs"`: set its `content.mod` to `"tabs-graph"`.
- The stack with `"id": "panel-body"` (it holds `files` and `changes`): append
  a third child:

```json
{ "id": "graph", "type": "block", "content": { "mod": "git-graph" } }
```

## 4. Check

```sh
herdr-app check ~/.config/herdr-app/mods/tabs-graph
herdr-app check ~/.config/herdr-app/mods/git-graph
herdr-app status          # "errors": [] and "layout": "main-graph"
```

On Herdr 0.1.9 for macOS, `herdr-app check` crashes for every mod, Herdr's own
included (a GPUI unwrap before the first frame). There, rely on
`herdr-app status` and look at the window instead.

Click **Graph** in the top bar. If the window doesn't show your edits, switch
layouts away and back (`ctrl-shift-l` twice): a copy that was reloaded while
open can keep drawing its old frame.

## Going back

`ctrl-shift-l` switches back to Herdr's `main`. Deleting `layouts/main-graph.json`
and `mods/tabs-graph/` removes the clones; `mods/git-graph/` can stay for use as
a pane.
