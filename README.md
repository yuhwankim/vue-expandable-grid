# vue-expandable-grid

[![npm version](https://badge.fury.io/js/vue-expandable-grid.svg)](https://badge.fury.io/js/vue-expandable-grid)
[![Build Status](https://travis-ci.org/TAGC/vue-expandable-grid.svg?branch=master)](https://travis-ci.org/TAGC/vue-expandable-grid)

Vue component that acts as a grid that can expand indefinitely in all directions. This library builds upon Weijia Wang's [vue-virtual-collection](https://github.com/starkwang/vue-virtual-collection).

## Features

- Supports various forms of grid navigation:
  - Panning
  - Scrolling
  - Zooming (zoom levels are customisable)
- Publishes grid-related events:
  - On resizing the grid
  - On zooming in and out
  - On moving the mouse around the grid
  - On clicking somewhere in the grid
- Customisable grid tiles
  - Pre-made catalog of grid tiles included
- Allows placing arbitrary items on the grid

## Usage

Install from NPM:

`$ npm install vue-expandable-grid`

OR

`$ yarn add vue-expandable-grid`

In a `*.vue` file, import the component:

```html
<template>
  <ExpandableGrid />
</template>

<script language="typescript">
import ExpandableGrid from "vue-expandable-grid"

// TODO
</script>
```

## Terminology

**Grid**: the component representing a two-dimensional space that tiles and grid items are rendered on.

**Viewport**: The recentangular subset of the grid that is visible on the screen. The viewport can be scrolled to make different areas of the grid visible. The grid can also be zoomed to make more or less of it visible through the viewport.

**Extent**: The position and size of an entity in a Cartesian (2D) plane. In other words, an object's extent is determined by its x, y, width and height properties.

**Zoom Level**: the extent to which the grid is zoomed in or out by. Represented as a numerical value that acts as a scale factor applied to the extent of all grid objects (tiles and items).

**Logical grid coordinate space**: A *zoom-independent* coordinate space used for specifying the extent of an object in the grid. For example, an object that is 50x50 pixels in logical coordinates remains 50x50 pixels regardless of how far the grid is scrolled in or out.

**Physical grid coordinate space**: A *zoom-dependent* coordinate space that expresses the extent of objects in terms of the actual pixels that will be used to draw them. An object that is 50x50 pixels in physical coordinates at a zoom level of 1 will be 100x100 at zoom level of 2 and 25x25 at a zoom level of 0.5, since the physical size of this object will change based on zoom.

**Tiles**: Grid objects representing fixed-extent tiles that are automatically generated as the grid is resized or the viewport repositioned. Vue components making use of the grid cannot control the generation, position or size of the tiles, but they can control the appearance.

**Grid Items**: Objects that Vue components making use of the grid can place on the grid. Each item has an extent that determines where its position and size on the grid. The extent of each item should be declared in *logical* coordinate space - the grid takes care of resizing and repositioning the items as the zoom level changes.

**Grid Events**: Vue events published by the grid in response to events occurring on the grid. Events associated with a position on the grid will express that position in *logical* coordinate space.