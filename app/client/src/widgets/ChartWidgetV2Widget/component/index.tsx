import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { Colors } from "constants/Colors";
import styled from "styled-components";
import type { ChartType, ChartSelectedDataPoint } from "../constants";
import type { WidgetPositionProps } from "widgets/BaseWidget";
import { error } from "console";
import { reset } from "redux-form";

const CanvasContainer = styled.div<ChartWidgetV2ComponentProps>`
  border-radius: ${({ borderRadius }) => borderRadius};
  box-shadow: ${({ boxShadow }) => `${boxShadow}`} !important;
  height: 100%;
  width: 100%;
  background: ${Colors.WHITE};
  overflow: hidden;
  position: relative;
  padding: 10px 0 0 0;
}`;

function ChartWidgetV2Component(props: ChartWidgetV2ComponentProps) {
  const chartContainerId = props.widgetId + "chart-container";
  // console.log("***", "function is loading again");
  const [chartInstance, setChartInstance] = useState<echarts.ECharts>();
  const [needsChartReset, setNeedsChartReset] = useState(false)
  // let dom : any = ""
  // const [chartError, setChartError] = useState<Error>();

  useEffect(() => {
    const chartContainerElement = document.getElementById(chartContainerId);
    // console.log("***", "chart container id is ", chartContainerId);
    // console.log("***", "chart container element is ", chartContainerElement);

    if (!chartContainerElement) {
      throw "Unable to find chart container dom element";
    }

    const chart = echarts.init(chartContainerElement);
    chart.on("click", function (params) {
      // console.log("***", "chart point clicked with params ", params);
      // console.log(params)
      if (props.onDataPointClick) {
        props.onDataPointClick({
          data: params.data,
          seriesName: params.seriesName ?? "",
        });
      }
    });

    // chart.on('click', function (params) {
    //   props.onDataPointClick?({data: {}, seriesName: ""})
    // });

    // const options = {
    //   ...props.chartConfig,
    //   dataset: props.chartData
    // };

    // chart.setOption(options);
    setChartInstance(chart);
    return function cleanup() {
      chart.dispose();
    };
  }, [needsChartReset]);

  useEffect(() => {
    // console.log(
    //   "***",
    //   "props on data point click changed",
    //   Boolean(props.onDataPointClick),
    //   props.onDataPointClick,
    // );
  }, [props.onDataPointClick]);

  useEffect(() => {
    // console.log("****", "props have changed ", props);
    let options: echarts.EChartsCoreOption = {};
    if (props.chartType === "CUSTOM_ECHARTS_CHART") {
      options = { ...props.customChartData };
      // console.log("***", "setting custom chart data");
    } else {
      options = {
        ...props.chartConfig,
        dataset: props.chartData,
      };
      // console.log("***", "setting normal chart data");
    }

    // console.log("***", "going to set options ", options);
    
    // try {
      chartInstance?.setOption(options, true);
    // } catch (error : any) {
    //   console.log("***", "exception in charts data")
    //   console.log("***", "error in echarts configuration ", error)
      
    //   // setChartError(error)
    //   // chartError = error
    //   alert(`Hey error ${error}`)
    //   // setNeedsChartReset(!needsChartReset)
    // }
    console.log("***", "after catch");  
  });

  useEffect(() => {
    chartInstance?.resize();
  }, [props.leftColumn, props.rightColumn, props.bottomRow, props.topRow]);

  return (
  <div style={{width: "100%", height:"100%"}}>
    <CanvasContainer id={chartContainerId} {...props}></CanvasContainer>
    {/* { chartError ? <p>chart error is {chartError}</p> : <p>no chart error</p> } */}
  </div>
  );
}

export interface ChartWidgetV2ComponentProps extends WidgetPositionProps {
  widgetId: string;
  chartData: any;
  chartConfig: any;
  chartType: ChartType;
  customChartData: any;
  borderRadius: string;
  boxShadow: string;
  onDataPointClick:
    | ((selectedDataPoint: ChartSelectedDataPoint) => void)
    | undefined;
  hasOnDataPointClick: boolean;
}

export default ChartWidgetV2Component;
