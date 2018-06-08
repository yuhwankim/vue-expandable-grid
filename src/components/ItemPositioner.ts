import * as _ from "lodash";
import { Extent, ZERO_EXTENT } from "./ExtentCalculator";
import GridManager from "./GridManager";

/**
 * Represents an item that can be placed on the grid.
 */
export interface IGridItem extends Extent {
  data: any;
}

/**
 * A type of grid manager responsible for handling the position of items on the grid.
 */
export default class ItemPositioner extends GridManager<IGridItem> {
  public _gridExtent: Extent;

  constructor() {
    super();
    this.gridExtent = ZERO_EXTENT;
  }

  set gridExtent(newExtent: Extent) {
    this._gridExtent = newExtent;
  }

  get gridExtent(): Extent {
    return this._gridExtent;
  }

  public canManage(object: any): object is IGridItem {
    return !_.isUndefined(object.data) && !object.data.isTile;
  }

  public position(item: IGridItem): Extent {
    const grid = this.gridExtent;

    // Positioning is done in *logical* (zoom-independent) grid coordinate space.

    return {
      width: item.width,
      height: item.height,
      x: item.x - (grid.x < 0 ? grid.x : 0),
      y: item.y - (grid.y < 0 ? grid.y : 0),
    };
  }
}
