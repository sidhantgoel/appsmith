import { DEFAULT_HIGHLIGHT_SIZE } from "components/designSystems/appsmith/autoLayout/FlexBoxComponent";
import { FLEXBOX_PADDING, RenderModes } from "constants/WidgetConstants";
import {
  FlexLayerAlignment,
  ResponsiveBehavior,
  ROW_GAP,
} from "utils/autoLayout/constants";
import type { HighlightInfo } from "./autoLayoutTypes";
import { getWidgetHeight } from "./flexWidgetUtils";
import type { VerticalHighlightsPayload } from "./highlightUtils";
import {
  deriveHighlightsFromLayers,
  generateHighlightsForAlignment,
  generateVerticalHighlights,
} from "./highlightUtils";

describe("test HighlightUtils methods", () => {
  describe("test deriveHighlightsFromLayers method", () => {
    it("should generate horizontal highlights for empty canvas", () => {
      const widgets = {
        "1": {
          widgetId: "1",
          leftColumn: 0,
          rightColumn: 64,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 70,
          type: "CANVAS_WIDGET",
          widgetName: "Canvas1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 1,
          parentRowSpace: 1,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 70,
          mobileLeftColumn: 0,
          mobileRightColumn: 640,
          responsiveBehavior: ResponsiveBehavior.Fill,
          parentId: "",
          flexLayers: [],
          children: [],
        },
      };
      const highlights: HighlightInfo[] = deriveHighlightsFromLayers(
        widgets,
        {},
        { left: 0, top: 0 },
        "1",
        632,
      );
      expect(highlights.length).toEqual(3);
      expect(highlights[0].isVertical).toBeFalsy;
      // width of each horizontal highlight = container width / 3 - padding.
      expect(Math.round(highlights[0].width)).toEqual(211);
      expect(highlights[0].height).toEqual(4);
      // x position of each horizontal highlight = (container width / 3) * index + padding.
      expect(Math.round(highlights[1].posX)).toEqual(215);
      expect(Math.round(highlights[2].posX)).toEqual(425);
    });
    it("should add horizontal heights before every layer and below the last layer", () => {
      const widgets = {
        "1": {
          widgetId: "1",
          leftColumn: 0,
          rightColumn: 64,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 70,
          type: "CANVAS_WIDGET",
          widgetName: "Canvas1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 1,
          parentRowSpace: 1,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 70,
          mobileLeftColumn: 0,
          mobileRightColumn: 640,
          responsiveBehavior: ResponsiveBehavior.Fill,
          parentId: "",
          flexLayers: [
            { children: [{ id: "2", align: FlexLayerAlignment.Start }] },
          ],
          children: ["2"],
        },
        "2": {
          widgetId: "2",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 4,
          type: "BUTTON_WIDGET",
          widgetName: "Button1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 1.546875,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 4,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
      };

      const widgetPositions = {
        "2": {
          left: 0,
          top: 0,
          width: 160,
          height: 40,
        },
      };
      const offsetTop = ROW_GAP;
      const highlights: HighlightInfo[] = deriveHighlightsFromLayers(
        widgets,
        widgetPositions,
        { left: 0, top: 0 },
        "1",
        640,
      );
      expect(highlights.length).toEqual(10);
      expect(
        highlights[0].isVertical ||
          highlights[1].isVertical ||
          highlights[2].isVertical,
      ).toBeFalsy;
      expect(
        highlights[7].isVertical ||
          highlights[8].isVertical ||
          highlights[9].isVertical,
      ).toBeFalsy;

      expect(highlights[0].posY).toEqual(FLEXBOX_PADDING);
      expect(highlights[7].posY).toEqual(
        highlights[0].posY +
          (widgets["2"].bottomRow - widgets["2"].topRow) *
            widgets["2"].parentRowSpace +
          ROW_GAP -
          offsetTop,
      );

      expect(highlights[0].layerIndex).toEqual(0);
      expect(highlights[0].isNewLayer).toBeTruthy;
      expect(highlights[7].layerIndex).toEqual(1);
      expect(highlights[7].isNewLayer).toBeTruthy;
    });
  });

  describe("test generateHighlightsForAlignment method", () => {
    it("should add vertical highlights before every widget in the alignment, and at the end of the last widget", () => {
      const children = [
        {
          widgetId: "2",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 4,
          type: "BUTTON_WIDGET",
          widgetName: "Button1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 4,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
      ];

      const widgetPositions = {
        "2": {
          left: 0,
          top: 0,
          width: 160,
          height: 40,
        },
      };
      const result: HighlightInfo[] = generateHighlightsForAlignment({
        arr: children,
        childCount: 0,
        canvasPositions: { left: 0, top: 0 },
        layerIndex: 0,
        alignment: FlexLayerAlignment.Start,
        maxHeight: 40,
        offsetTop: 4,
        canvasWidth: 640,
        avoidInitialHighlight: false,
        isMobile: false,
        startPosition: 0,
        canvasId: "1",
        widgetPositions,
      });
      expect(result.length).toEqual(2);
      expect(result[0].posX).toEqual(-1 * DEFAULT_HIGHLIGHT_SIZE);
      expect(result[0].posY).toEqual(0);
      expect(result[0].width).toEqual(4);
      expect(result[0].height).toEqual(
        getWidgetHeight(children[0], false) * children[0].parentRowSpace,
      );

      expect(result[1].posX).toEqual(
        children[0].rightColumn * children[0].parentColumnSpace,
      );
      expect(result[1].isNewLayer).toBeFalsy;
      expect(result[1].isVertical).toBeTruthy;
      expect(result[1].layerIndex).toEqual(0);
    });
    it("should create vertical highlights as tall as the tallest child in the row", () => {
      const children = [
        {
          widgetId: "2",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 4,
          type: "BUTTON_WIDGET",
          widgetName: "Button1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 4,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
        {
          widgetId: "3",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 6,
          type: "BUTTON_WIDGET",
          widgetName: "Button2",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 6,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
      ];

      const widgetPositions = {
        "2": {
          left: 0,
          top: 0,
          width: 160,
          height: 40,
        },
        "3": {
          left: 0,
          top: 0,
          width: 160,
          height: 60,
        },
      };

      const result: HighlightInfo[] = generateHighlightsForAlignment({
        arr: children,
        childCount: 0,
        layerIndex: 0,
        canvasPositions: { left: 0, top: 0 },
        alignment: FlexLayerAlignment.Start,
        maxHeight:
          getWidgetHeight(children[1], false) * children[1].parentRowSpace,
        offsetTop: 4,
        canvasWidth: 640,
        avoidInitialHighlight: false,
        isMobile: false,
        startPosition: 0,
        canvasId: "1",
        widgetPositions,
      });
      expect(result.length).toEqual(3);
      expect(result[0].height).toEqual(
        getWidgetHeight(children[1], false) * children[1].parentRowSpace,
      );
    });
    it("should not render initial highlight is avoidInitialHighlight is true", () => {
      const result: HighlightInfo[] = generateHighlightsForAlignment({
        arr: [],
        widgetPositions: {},
        childCount: 0,
        layerIndex: 0,
        canvasPositions: { left: 0, top: 0 },
        alignment: FlexLayerAlignment.Start,
        maxHeight: 40,
        offsetTop: 4,
        canvasWidth: 640,

        avoidInitialHighlight: true,
        isMobile: false,
        startPosition: 0,
        canvasId: "1",
      });
      expect(result.length).toEqual(0);
    });
  });

  describe("test generateVerticalHighlights method", () => {
    it("should not render initial highlight for an empty center alignment if one of the other alignments are encroaching its space", () => {
      const widgets = {
        "1": {
          widgetId: "1",
          leftColumn: 0,
          rightColumn: 64,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 70,
          type: "CANVAS_WIDGET",
          widgetName: "Canvas1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 1,
          parentRowSpace: 1,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 70,
          mobileLeftColumn: 0,
          mobileRightColumn: 640,
          responsiveBehavior: ResponsiveBehavior.Fill,
          parentId: "",
          flexLayers: [
            {
              children: [
                { id: "2", align: FlexLayerAlignment.Start },
                { id: "3", align: FlexLayerAlignment.Start },
              ],
            },
          ],
          children: ["2", "3"],
        },
        "2": {
          widgetId: "2",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 4,
          type: "BUTTON_WIDGET",
          widgetName: "Button1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 4,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
        "3": {
          widgetId: "3",
          leftColumn: 16,
          rightColumn: 26,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 6,
          type: "BUTTON_WIDGET",
          widgetName: "Button2",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 6,
          mobileLeftColumn: 16,
          mobileRightColumn: 26,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
      };

      const widgetPositions = {
        "2": {
          left: 0,
          top: 0,
          width: 160,
          height: 40,
        },
        "3": {
          left: 160,
          top: 0,
          width: 100,
          height: 60,
        },
      };
      const result: VerticalHighlightsPayload = generateVerticalHighlights({
        widgets,
        widgetPositions,
        layer: widgets["1"].flexLayers[0],
        childCount: 0,
        layerIndex: 0,
        offsetTop: 4,
        canvasPositions: { left: 0, top: 0 },
        canvasId: "1",
        canvasWidth: 640,
        draggedWidgets: [],
        isMobile: false,
      });
      expect(result.highlights.length).toEqual(4);
      expect(result.childCount).toEqual(2);
    });
    it("should not render highlights for flex wrapped alignments that span multiple rows", () => {
      const widgets = {
        "1": {
          widgetId: "1",
          leftColumn: 0,
          rightColumn: 64,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 70,
          type: "CANVAS_WIDGET",
          widgetName: "Canvas1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 1,
          parentRowSpace: 1,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 70,
          mobileLeftColumn: 0,
          mobileRightColumn: 640,
          responsiveBehavior: ResponsiveBehavior.Fill,
          parentId: "",
          flexLayers: [
            {
              children: [
                { id: "2", align: FlexLayerAlignment.Start },
                { id: "3", align: FlexLayerAlignment.Start },
              ],
            },
          ],
          children: ["2", "3"],
        },
        "2": {
          widgetId: "2",
          leftColumn: 0,
          rightColumn: 16,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 4,
          type: "BUTTON_WIDGET",
          widgetName: "Button1",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 0,
          mobileBottomRow: 4,
          mobileLeftColumn: 0,
          mobileRightColumn: 16,
          responsiveBehavior: ResponsiveBehavior.Hug,
          parentId: "1",
        },
        "3": {
          widgetId: "3",
          leftColumn: 16,
          rightColumn: 64,
          alignment: FlexLayerAlignment.Start,
          topRow: 0,
          bottomRow: 6,
          type: "INPUT_WIDGET",
          widgetName: "Button2",
          renderMode: RenderModes.CANVAS,
          version: 1,
          parentColumnSpace: 10,
          parentRowSpace: 10,
          isLoading: false,
          mobileTopRow: 4,
          mobileBottomRow: 10,
          mobileLeftColumn: 0,
          mobileRightColumn: 64,
          responsiveBehavior: ResponsiveBehavior.Fill,
          parentId: "1",
        },
      };

      const widgetPositions = {
        "2": {
          left: 0,
          top: 0,
          width: 158,
          height: 40,
        },
        "3": {
          left: 0,
          top: 40,
          width: 632,
          height: 60,
        },
      };
      const result: VerticalHighlightsPayload = generateVerticalHighlights({
        widgets,
        widgetPositions,
        canvasPositions: { left: 0, top: 0 },
        layer: widgets["1"].flexLayers[0],
        childCount: 0,
        layerIndex: 0,
        offsetTop: 0,
        canvasId: "1",
        canvasWidth: 632,
        draggedWidgets: [],
        isMobile: true,
      });
      expect(result.highlights.length).toEqual(3);
      expect(result.highlights[1].posY).toEqual(
        widgets["3"].mobileTopRow * widgets["3"].parentRowSpace,
      );
      expect(result.highlights[1].height).toEqual(60);
      expect(result.highlights[2].posX).toEqual(632);
      expect(result.highlights[2].posY).toEqual(
        widgets["3"].mobileTopRow * widgets["3"].parentRowSpace,
      );
      expect(result.childCount).toEqual(2);
    });
  });
});
