"use client";
import { useEffect, useRef } from 'react';
import { CrosshairMode, createChart } from 'lightweight-charts';
import moment from 'moment';

export interface ChartIntraday {
  time: string,
  open?: number,
  close?: number,
  high?: number,
  low?: number,
}

interface Props {
  data: ChartIntraday[],
  className?: string,
  visibleFrom?: string,
  visibleTo?: string,
}

let chart: import('lightweight-charts').IChartApi;

export const ChartComponent = (props: Props) => {
  const { data, visibleFrom, visibleTo, ...otherProps } = props;

  const chartContainerRef = useRef() as any;

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        textColor: 'rgba(0, 0, 0, 0.9)',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
    });

    const candleSeries = chart.addCandlestickSeries({});

    candleSeries.setData(data);

    setVisibleRange();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data]);

  useEffect(() => {
    setVisibleRange();
  }, [visibleFrom, visibleTo]);

  function setVisibleRange() {
    if (visibleFrom == null || visibleTo == null)
      chart.timeScale().fitContent();
    else // @ts-ignore
      chart.timeScale().setVisibleRange({ from: moment(visibleFrom).unix(), to: moment(visibleTo).unix() });
  }

  return (
    <div
      ref={chartContainerRef}
      {...otherProps} />
  );
};