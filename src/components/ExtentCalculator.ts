import { isEmpty, isEqual } from "lodash";

/**
 * Represents the position of an entity on a cartesian plane.
 */
export class Position {
  constructor(readonly x: number, readonly y: number) {

  }
}

/**
 * Represents the size of an entity on a cartesian plane.
 */
export class Size {
  constructor(readonly width: number, readonly height: number) {

  }
}

/**
 * Represents the extent an entity covers of a cartesian plane.
 */
export class Extent implements Position, Size {
  /**
   * Derives a new extent based on repositioning a provided extent.
   *
   * @param param0 the extent to derive from
   * @param x the x coordinate of the new extent
   * @param y the y coordinate of the new extent
   * @return a new extent
   */
  public static reposition({ width, height }: Extent, x: number, y: number): Extent {
    return new Extent(x, y, width, height);
  }

  /**
   * Derives a new extent based on resizing a provided extent.
   *
   * @param param0 the extent to derive from
   * @param width the width of the new extent
   * @param height the height of the new extent
   * @return a new extent
   */
  public static resize({ x, y }: Extent, width: number, height: number): Extent {
    return new Extent(x, y, width, height);
  }

  public readonly type: "Extent" = "Extent";

  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number) {

  }
}

/**
 * Represents the extent an entity covers in terms of grid tiles.
 */
export class TileExtent {
  /**
   * Converts a TileExtent to an Extent.
   *
   * @param tileExtent A tile extent
   * @param tileSize The size of the tiles
   * @return the corresponding extent
   */
  public static toExtent(tileExtent: TileExtent, tileSize: number): Extent {
    return new Extent(
      tileExtent.column * tileSize,
      tileExtent.row * tileSize,
      tileExtent.columnSpan * tileSize,
      tileExtent.rowSpan * tileSize);
  }

  public readonly type: "TileExtent" = "TileExtent";

  constructor(
    readonly column: number,
    readonly row: number,
    readonly columnSpan: number,
    readonly rowSpan: number) {
    if (columnSpan < 0) {
      throw new Error("Column span canno tbe less than 0");
    } else if (rowSpan < 0) {
      throw new Error("Row span cannot be less than 0");
    }
  }
}

/**
 * Represents an entity located at the origin of a cartesian plane.
 */
export const ORIGIN = new Position(0, 0);
/**
 * Represents an entity with zero width and height.
 */
export const ZERO_SIZE = new Size(0, 0);

/**
 * Represents an entity with no extent.
 */
export const ZERO_EXTENT = new Extent(0, 0, 0, 0);

/**
 * A class used for calculating the extent of the grid.
 */
export default class ExtentCalculator {
  /**
   * Scales an extent based on a provided scale factor.
   *
   * @param extent the extent to scale
   * @param scaleFactor the factor to scale the properties of the extent by
   * @return the scaled extent
   */
  public static scaleExtent(extent: Extent, scaleFactor: number): Extent {
    return new Extent(
      extent.x * scaleFactor,
      extent.y * scaleFactor,
      extent.width * scaleFactor,
      extent.height * scaleFactor);
  }

  /**
   * Scales a position based on a provided scale factor.
   *
   * @param position the position to scale
   * @param scaleFactor the factor to scale the coordinates of the position by
   * @return the scaled position
   */
  public static scalePosition(position: Position, scaleFactor: number) {
    return new Position(position.x * scaleFactor, position.y * scaleFactor);
  }

  /**
   * Descales an extent based on a provided scale factor.
   *
   * This is equivalent to scaling the extent by the inverse of the provided scale factor.
   *
   * @param extent the extent to descale
   * @param scaleFactor the factor to descale the properties of the extent by
   * @return the descaled extent
   */
  public static descaleExtent(extent: Extent, scaleFactor: number) {
    return ExtentCalculator.scaleExtent(extent, 1 / scaleFactor);
  }

  /**
   * Descales a position based on a provided scale factor.
   *
   * This is equivalent to descaling the position by the inverse of the provided scale factor.
   *
   * @param position the position to descale
   * @param scaleFactor the factor to descale the coordinates of the position by
   * @return the descaled position
   */
  public static descalePosition(position: Position, scaleFactor: number) {
    return ExtentCalculator.scalePosition(position, 1 / scaleFactor);
  }

  /**
   * Returns whether `position` is contained within `extent`.
   *
   * A position is still considered within the extent if it exists on its boundary.
   *
   * @param position the position to test
   * @param extent the extent to check the position lies within
   * @return true if the position is inside the extent, otherwise false
   */
  public static isPositionInExtent(position: Position, extent: Extent) {
    const positionExtent = new Extent(position.x, position.y, 0, 0);
    const newExtent = ExtentCalculator.reduceExtents([positionExtent, extent]);

    return isEqual(extent, newExtent);
  }

  /**
   * Calculates the extent of the grid based on the extent of the viewports and the items on the
   * grid.
   *
   * All values are expected and returned in logical (zoom-independent) grid coordinate space.
   *
   * @param viewportExtent the extent of the grid viewport
   * @param forcedMinimumExtent the forced minimum extent of the grid
   * @param tileSize the size of the grid tiles
   * @param itemExtents the individual extents of all the items located on the grid
   * @return the necessary extent of the grid
   */
  public static calculateGridExtent(
    viewportExtent: Extent,
    forcedMinimumExtent: Extent,
    tileSize: number,
    itemExtents: Array<Extent | TileExtent>): Extent {

    const normalizedItemExtents = ExtentCalculator.normalizeItemExtents(itemExtents, tileSize);
    const minimumExtentFromViewport = ExtentCalculator.deriveMinimumGridExtent(viewportExtent);
    const gridExtent = ExtentCalculator.reduceExtents([
      minimumExtentFromViewport,
      forcedMinimumExtent,
      ...normalizedItemExtents,
    ]);

    return gridExtent;
  }

  /**
   * Normalizes the extents of items (which may be expressed in pixels or grid tiles).
   *
   * @param extents the collection of item extents
   * @param tileSize the size of grid tiles
   * @return the collection of item extents expressed in pixels
   */
  private static normalizeItemExtents(
    extents: Array<Extent | TileExtent>,
    tileSize: number): Extent[] {

    return extents.map((extent) => {
      switch (extent.type) {
        case "Extent": return extent;
        case "TileExtent": return TileExtent.toExtent(extent, tileSize);
        default: throw new Error(`Invalid extent for item: ${extent}`);
      }
    });
  }

  /**
   * Derives the necessary extent of the grid based purely on the extent of the viewport.
   *
   * In other words, this is the extent the grid will have if there are no other extents that
   * need to be taken into consideration e.g. items placed on the grid.
   *
   * The viewport extent is expected to be provided in logical grid coordinate space. The extent
   * of the viewport in this coordinate space is expected to grow when the grid is zoomed out and
   * vice versa.
   *
   * The minimum necessary extent will also be returned in logical grid coordinate space.
   *
   * @param viewportExtent the viewport extent
   * @return the necessary extent of the grid based on `viewportExtent`
   */
  private static deriveMinimumGridExtent(viewportExtent: Extent): Extent {
    const minX = Math.min(viewportExtent.x, 0);
    const minY = Math.min(viewportExtent.y, 0);
    const maxX = viewportExtent.width + Math.max(viewportExtent.x, 0);
    const maxY = viewportExtent.height + Math.max(viewportExtent.y, 0);

    return new Extent(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * Calculates the smallest extent that encapsulates all extents in the provided collection.
   *
   * @param extents the collection of extents to reduce
   * @return the smallest extent that encapsulates `extents`
   */
  private static reduceExtents(extents: Extent[]): Extent {
    if (!extents || isEmpty(extents)) {
      return ZERO_EXTENT;
    }

    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    for (const extent of extents) {
      minX = Math.min(minX, extent.x);
      minY = Math.min(minY, extent.y);
      maxX = Math.max(maxX, extent.x + extent.width);
      maxY = Math.max(maxY, extent.y + extent.height);
    }

    return new Extent(minX, minY, maxX - minX, maxY - minY);
  }

  private constructor() {

  }
}
