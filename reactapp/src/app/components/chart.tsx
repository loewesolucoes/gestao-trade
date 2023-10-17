"use client";
import { useEffect, useRef } from 'react';
import { CrosshairMode, createChart } from 'lightweight-charts';
import { ChartIntraday } from '../models';

export const ChartComponent = (props: { data: ChartIntraday[], className: string }) => {
  const { data, ...otherProps } = props;

  const chartContainerRef = useRef() as any;

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        textColor: 'rgba(255, 255, 255, 0.9)',
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

    chart.timeScale().fitContent();

    const candleSeries = chart.addCandlestickSeries({});

    candleSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      {...otherProps} />
  );
};