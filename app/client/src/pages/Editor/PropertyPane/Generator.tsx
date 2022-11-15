import { IPanelProps } from "@blueprintjs/core";
import {
  PropertyPaneConfig,
  PropertyPaneControlConfig,
  PropertyPaneSectionConfig,
} from "constants/PropertyControlConstants";
import { WidgetType } from "constants/WidgetConstants";
import React, { useRef } from "react";
import PropertyControl from "./PropertyControl";
import PropertySection from "./PropertySection";
import { EditorTheme } from "components/editorComponents/CodeEditor/EditorConfig";
import Boxed from "../GuidedTour/Boxed";
import { GUIDED_TOUR_STEPS } from "../GuidedTour/constants";
import { EmptySearchResult } from "./EmptySearchResult";
import { useSelector } from "react-redux";
import { getWidgetPropsForPropertyPane } from "selectors/propertyPaneSelectors";
import { searchProperty } from "./propertyPaneSearch";
import { evaluateHiddenProperty } from "./helpers";

export type PropertyControlsGeneratorProps = {
  id: string;
  config: readonly PropertyPaneConfig[];
  type: WidgetType;
  panel: IPanelProps;
  theme: EditorTheme;
  searchQuery?: string;
};

const generatePropertyControl = (
  propertyPaneConfig: readonly PropertyPaneConfig[],
  props: PropertyControlsGeneratorProps,
) => {
  if (!propertyPaneConfig) return null;
  return propertyPaneConfig.map((config: PropertyPaneConfig) => {
    if ((config as PropertyPaneSectionConfig).sectionName) {
      const sectionConfig: PropertyPaneSectionConfig = config as PropertyPaneSectionConfig;
      return (
        <PropertySection
          childCount={config.children?.length ?? 0}
          collapsible={sectionConfig.collapsible ?? true}
          id={config.id || sectionConfig.sectionName}
          isDefaultOpen={sectionConfig.isDefaultOpen}
          key={config.id + props.id + props.searchQuery}
          name={sectionConfig.sectionName}
          propertyPath={sectionConfig.propertySectionPath}
          tag={sectionConfig.tag}
        >
          {config.children && generatePropertyControl(config.children, props)}
        </PropertySection>
      );
    } else if ((config as PropertyPaneControlConfig).controlType) {
      return (
        <Boxed
          key={config.id + props.id}
          show={
            (config as PropertyPaneControlConfig).propertyName !==
              "tableData" && props.type === "TABLE_WIDGET"
          }
          step={GUIDED_TOUR_STEPS.TABLE_WIDGET_BINDING}
        >
          <PropertyControl
            key={config.id + props.id}
            {...(config as PropertyPaneControlConfig)}
            panel={props.panel}
            theme={props.theme}
          />
        </Boxed>
      );
    }
    throw Error("Unknown configuration provided: " + props.type);
  });
};

function PropertyControlsGenerator(props: PropertyControlsGeneratorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const widgetProps: any = useSelector(getWidgetPropsForPropertyPane);
  const finalProps = evaluateHiddenProperty(props.config, widgetProps);
  const searchResults = searchProperty(
    finalProps as PropertyPaneSectionConfig[],
    props.searchQuery,
  );

  const isSearchResultEmpty = searchResults.length === 0;

  return isSearchResultEmpty ? (
    <EmptySearchResult />
  ) : (
    <div ref={wrapperRef}>
      {generatePropertyControl(
        searchResults as readonly PropertyPaneConfig[],
        props,
      )}
    </div>
  );
}

export default PropertyControlsGenerator;
