import React from "react";

import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import type { ReactNode } from "react";

import ChartWidgetV2Component, { CanvasContainer, ChartErrorComponent } from "../component";
import ChartPlaceholderComponent from "../component/ChartPlaceholderComponent";
import { propertyPaneConfig, styleConfig } from "./propertyPaneConfig";

import type { ChartType, ChartSelectedDataPoint } from "../constants";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { Stylesheet } from "entities/AppTheming";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import styled from "styled-components";
import { error } from "console";

type Props = { children: ReactNode };
type State = { hasError: boolean };

const ErrorBoundaryContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const RetryLink = styled.span`
  color: ${(props) => props.theme.colors.primaryDarkest};
  cursor: pointer;
`;
class MyErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    debugger
    console.log("***", "chart widget catching error ", typeof(error), typeof(errorInfo), error, errorInfo)
    // log.error({ error, errorInfo });
    // Sentry.captureException(error);
  }

  render() {
    return (
      <div>
        Yes, we have error
        <ErrorBoundaryContainer className="error-boundary">
        {
        // this.state.hasError ? (
        //   <p>
        //     Oops, Something went wrong 123.
        //     <br />
        //     <RetryLink onClick={() => this.setState({ hasError: false })}>
        //       Click here to retry
        //     </RetryLink>
        //   </p>
        // ) : (
          this.props.children
        // )
        }
      </ErrorBoundaryContainer>
      </div>
    );
  }
}
class ChartWidgetV2Widget extends BaseWidget<
  ChartWidgetV2WidgetProps,
  WidgetState
> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Chart widget is used to view the graphical representation of your data. Chart is the go-to widget for your data visualisation needs.",
      "!url": "https://docs.appsmith.com/widget-reference/chart",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      selectedDataPoint: {
        data: "Record<string, unknown>",
        seriesName: "string",
      },
    };
  }
  static getPropertyPaneContentConfig() {
    return propertyPaneConfig;
  }

  static getPropertyPaneStyleConfig() {
    return styleConfig;
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {};
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {};
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedDataPoint: undefined,
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "{{appsmith.theme.boxShadow.appBoxShadow}}",
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      fontFamily: "{{appsmith.theme.fontFamily.appFont}}",
    };
  }

  onDataPointClick = (selectedDataPoint: ChartSelectedDataPoint) => {
    console.log(
      "***",
      "on data click for widget called",
      selectedDataPoint,
      this.props.onDataPointClick,
    );

    this.props.updateWidgetMetaProperty(
      "selectedDataPoint",
      selectedDataPoint,
      {
        triggerPropertyName: "onDataPointClick",
        dynamicString: this.props.onDataPointClick,
        event: {
          type: EventType.ON_DATA_POINT_CLICK,
        },
      },
    );
  };
  evaluationErrorsPresent = () => {
    debugger;
    var chartDataErrors = []
    let errorsPresent = false
    chartDataErrors = this.props.__evaluation__?.errors?.["chartData"]
    ?? this.props.__evaluation__?.errors?.["chartConfig"]
    ?? this.props.__evaluation__?.errors?.["customChartData"] ?? []
    if (chartDataErrors.length > 0) {
      errorsPresent = true
    }

    if (!errorsPresent) {
      const evaluations = this.props.__evaluation__?.errors?.["\'__evaluation__"] as Record<string, any>
      const errors = evaluations && evaluations["errors"]
      if (errors) {

        chartDataErrors = errors["chartData"]
        ?? errors["chartConfig"]
        ?? errors["customChartData"] ?? []
        if (Object.keys(chartDataErrors).length > 0) {
          errorsPresent = true
        }
        debugger
      }
      debugger;
      // if (evaluations && evaluations.errors) {

      // }
    }


    
    debugger
    return errorsPresent
  }

  

  getPageView() {
    console.log("***", "receiving props in widget ", this.props)
    
    debugger
    const errorsPresent = this.evaluationErrorsPresent()
    debugger
    if (errorsPresent) {
      debugger
      return (
        <CanvasContainer>
          <ChartErrorComponent chartError="Syntax Error in chart configuration."></ChartErrorComponent>
        </CanvasContainer>
        )
    } else {
      return (
        // <MyErrorBoundary>
          <ChartWidgetV2Component
          {...this.props}
          hasOnDataPointClick={Boolean(this.props.onDataPointClick)}
          onDataPointClick={this.onDataPointClick}
        />
        // </MyErrorBoundary>
      );
    }
  }

  static getWidgetType(): string {
    return "CHARTWIDGETV2_WIDGET";
  }
}

export interface ChartWidgetV2WidgetProps extends WidgetProps {
  chartType: ChartType;
  chartData: any;
  chartConfig: any;
  customChartData: any;
  borderRadius: string;
  boxShadow: string;
  simulateCrash: string;
  onDataPointClick?: string;
}

export default ChartWidgetV2Widget;
