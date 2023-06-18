import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import { Colors } from "constants/Colors";
import styled from "styled-components";
import type { ChartType, ChartSelectedDataPoint } from "../constants";
import type { WidgetPositionProps } from "widgets/BaseWidget";
import { error } from "console";
import { reset } from "redux-form";
import { defaultChartDataset, DefaultChartConfigs } from "../constants";
import equal from "fast-deep-equal/es6";

export const CanvasContainer = styled.div`
  height: 100%;
  width: 100%;
  background: ${Colors.WHITE};
  overflow: hidden;
  position: relative;
  padding: 10px 0 0 0;
}`;

let errorCounter = 0

export function ChartErrorComponent(props : any) {

  const errorMessage = () => {
    const title = "Error in chart data/configuration"
    let subheading = "Message : "
    let body = ""
    debugger;

    const chartError = props.chartError
    const typeoferror = typeof(chartError) as string
    if (typeoferror == "error" || typeoferror == "object") {
      subheading += (chartError).message
      body += (chartError).stack ?? ""
    } else {
      subheading += chartError
    }
    return {
      title: title,
      subheading: subheading,
      body : body
    }
  }

  return (
    <div  style={{position: "absolute", backgroundColor: "white", opacity: "90%", top: "0px", left: "0px", width: "100%", height:"100%"}}>
      <h1 style={{height: "20%", fontSize: "xx-large", fontWeight: 800}}>{errorMessage().title}</h1>
      <p style={{height: "20%", fontSize: "x-large", fontWeight: 800}}>{errorMessage().subheading}</p>
      <div style={{height: "60%"}}>
        <p style={{fontSize: "large", fontWeight: 800}}>Stack :</p>
        <br />
        <p style={{overflowY: "scroll", fontSize: "medium", height: "70%"}}>{errorMessage().body}</p>
      </div>
    </div>
  )
}

function useTraceUpdate(props : any) {
  const prev = useRef(props);
  console.log("***", 'trace update called :');
  useEffect(() => {
    console.log("***", 'trace update use effect called :');
    const changedProps = Object.entries(props).reduce((ps : any, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log("***", 'Changed props:', changedProps);
    }
    prev.current = props;
  });
}

function ChartWidgetV2Component(props: ChartWidgetV2ComponentProps) {
  // useTraceUpdate(props)
  console.log("***", "getting props, are they equal ? ", props)
  const [chartContainerId, setChartContainerID] = useState(props.widgetId + "chart-container")
  // console.log("***", "function is loading again");
  const [chartInstance, setChartInstance] = useState<echarts.ECharts>();
  const [needsChartReset, setNeedsChartReset] = useState(false)
  // let dom : any = ""
  const [chartError, setChartError] = useState<unknown>();
  // let chartError = "rajat error"
  const [chartData, setChartData] = useState<any>()
  const [needsReRender, setNeedsReRender] = useState(true)

  useEffect(() => {
    console.log("***", "chart container id is ", chartContainerId)
    // setChartContainerID(props.widgetId + "chart-container");
      const chartContainerElement = document.getElementById(chartContainerId);
      if (!chartContainerElement) {
        console.log("***", "unable to find chart container dom element")
        // throw "Unable to find chart container dom element";
      return
    } else {
      console.log("***", "chart container dom element is present")
    }
    console.log("***", "chart error is ", chartError)

    const chart = echarts.init(chartContainerElement);

    if (chartError) {
      const chartConfig = (DefaultChartConfigs[props.chartType])
        const options = {
        ...chartConfig,
        dataset: defaultChartDataset
      };
  
      chart.setOption(options, true);
    }
        
      setChartInstance(chart)

        return function cleanup() {
      console.log("***", "disposing of chart widget")
      chart.dispose();
    };
  }, [chartError])

  useEffect(() => {
    console.log("***", "should simulate crash ", props.simulateCrash)
    if (props.simulateCrash == "YES") {
      
      try {
        console.log("***", "simulating crash");
        errorCounter = errorCounter + 1
        throw `random error ${errorCounter}`
      } catch(error : unknown) {
        console.log("***", "setting error in catch");
        setChartError(error)
      }
    } else {
      console.log("***", "not simulating a crash")
      setChartError(null)
    }
    // if (chartContainerId.length == 0) {
    //   console.log("***", "chart container id length is 0")
    //   return
    // } else {
    //   console.log("***", "chart container id length is greater than 0")
    // }
  }, [props.simulateCrash])

  useEffect(() => {
    if (!chartInstance) {
      console.log("**", "chart instance not present, nothing to do")
    } else {
      console.log("***", "chart instance present, we should data now")
      let needsChartDataUpdate = false
      const options = chartOptionsFunction()
      
      if (chartError) {
        if (!equal(chartData, options)) {
          needsChartDataUpdate = true
        }
      } else {
        needsChartDataUpdate = true
      }

      if (needsChartDataUpdate) {
        console.log("***", "needs chart data update")
        
        try {
          // let options: echarts.EChartsCoreOption = {};
          // if (props.chartType === "CUSTOM_ECHARTS_CHART") {
          //   options = { ...props.customChartData };
          //   // console.log("***", "setting custom chart data");
          // } else {
          //   options = {
          //     ...props.chartConfig,
          //     dataset: props.chartData,
          //   };
          //   // console.log("***", "setting normal chart data");
          // }
          // const options = chartOptionsFunction()
          
          setChartData(options)
          chartInstance.setOption(options, true);
          if (chartError) {
            setChartError(null)
          }
        } catch (error) {
          console.log("***", "setting error in catch while setting options");
          setChartError(error)
        }
      } else {
        console.log("***", "doesn't need chart data update")
      }
    }
  }, [chartInstance, props.chartData, props.chartConfig, props.customChartData])

  function chartOptionsFunction() {
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
    return options
  }

  // useEffect(() => {
  //   console.log("***", "coming in first use effect")
    
  //   const chartContainerElement = document.getElementById(chartContainerId);
  //   // console.log("***", "chart container id is ", chartContainerId);
  //   // console.log("***", "chart container element is ", chartContainerElement);

  //   if (!chartContainerElement) {
  //     // throw "Unable to find chart container dom element";
  //     return
  //   }

  //   const chart = echarts.init(chartContainerElement);
  //   chart.on("click", function (params) {
  //     // console.log("***", "chart point clicked with params ", params);
  //     // console.log(params)
  //     if (props.onDataPointClick) {
  //       props.onDataPointClick({
  //         data: params.data,
  //         seriesName: params.seriesName ?? "",
  //       });
  //     }
  //   });

  //   // chart.on('click', function (params) {
  //   //   props.onDataPointClick?({data: {}, seriesName: ""})
  //   // });

  //   if (chartError) {
  //     console.log("***", "chart error present, setting default data")
  //     const chartConfig = (DefaultChartConfigs[props.chartType])
  //     const options = {
  //       ...chartConfig,
  //       dataset: defaultChartDataset
  //     };
  
  //     chart.setOption(options);
  //   }
    
  //   setChartInstance(chart);
    
  //   return function cleanup() {
  //     console.log("***", "disposing of chart widget")
  //     chart.dispose();
  //   };
  // }, [chartError, chartContainerId]);

  // useEffect(() => {
  //   // console.log(
  //   //   "***",
  //   //   "props on data point click changed",
  //   //   Boolean(props.onDataPointClick),
  //   //   props.onDataPointClick,
  //   // );
  // }, [props.onDataPointClick]);

  // useEffect(() => {
  //   console.log("***", "setting chart data ")
  //   // setChartData(props.chartData)
  //   // console.log("****", "props have changed ", props);
  //   let options: echarts.EChartsCoreOption = {};
  //   if (props.chartType === "CUSTOM_ECHARTS_CHART") {
  //     options = { ...props.customChartData };
  //     // console.log("***", "setting custom chart data");
  //   } else {
  //     options = {
  //       ...props.chartConfig,
  //       dataset: props.chartData,
  //     };
  //     // console.log("***", "setting normal chart data");
  //   }
  //   if (equal(chartData, options)) {
  //     console.log("***", "chart data same as last time. skipping update data")
  //     return
  //   } else {
  //     console.log("***", "yes the data can be updated since it is different")
  //   }
  //   // console.log("***", "setting chart data state")
  //   // console.log("***", "after setting chart data state")

  //   // console.log("***", "chart error is already set to ", chartError);
  //   // if (chartError) {
  //   //   console.log("***", "chart error present, not going to update chart data")
  //   //   return
  //   // }

  //   try {
  //     console.log("***", "chart instance is ", chartInstance)
  //     console.log("***", "options is ", options)

  //     chartInstance?.setOption(options, true);
  //     console.log("***", "previous chart error in try", chartError)
  //     setChartData(options)
  //     if (chartError) {
  //       console.log("***", "chart error is present, need to rerender")
  //       setChartError(undefined)
  //     }
  //     // if (props.simulateCrash === "YES") {
  //     //   errorCounter = errorCounter + 1
  //     //   throw `random error ${errorCounter}`
  //     // }
  //   } catch (error : any) {
  //     // console.log("***", "exception in echarts configuration ", error, typeof(error))
  //     // console.log("***", "previous chart error in catch", chartError)
  //     // setChartError(error)
  //   }
    
  //   console.log("***", "after catch");  
  // });

  useEffect(() => {
    chartInstance?.resize();
  }, [props.leftColumn, props.rightColumn, props.bottomRow, props.topRow]);

  return (
  <div style={{ position: "relative", width: "100%", height:"100%"}}>
    {/* <div>rajat</div>
    <div>{chartError}</div> */}
    <CanvasContainer id={chartContainerId}></CanvasContainer>
    {chartError && <ChartErrorComponent chartError={chartError}></ChartErrorComponent>}
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
  simulateCrash: string;
  onDataPointClick:
    | ((selectedDataPoint: ChartSelectedDataPoint) => void)
    | undefined;
  hasOnDataPointClick: boolean;
}

export default ChartWidgetV2Component;
