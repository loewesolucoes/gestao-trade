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

export interface ChartFiboLines {
  fibo0: number
  fibo382: number
  fibo618: number
  fibo50: number
  fibo1000: number
}

interface CustomProps {
  data: ChartIntraday[],
  analysis: ChartFiboLines[],
  className?: string,
  visibleFrom?: string,
  visibleTo?: string,
}

let chart: import('lightweight-charts').IChartApi;

export const ChartComponent = (props: CustomProps) => {
  const { data, analysis, visibleFrom, visibleTo, ...otherProps } = props;

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

    const x = analysis[analysis.length - 1];

    candleSeries.createPriceLine({
      price: x.fibo0,
      color: '#000',
      title: 'fibo0',
      lineStyle: 0,
    })
    
    candleSeries.createPriceLine({
      price: x.fibo382,
      color: '#000',
      title: 'fibo382',
    })
    
    candleSeries.createPriceLine({
      price: x.fibo618,
      color: '#000',
      title: 'fibo618',
    })
    
    candleSeries.createPriceLine({
      price: x.fibo50,
      color: '#000',
      title: 'fibo50',
    })
    
    candleSeries.createPriceLine({
      price: x.fibo1000,
      color: '#000',
      title: 'fibo1000',
      lineStyle: 0,
    })

    // for (let index = 0; index < analysis.length; index++) {
    //   const element = analysis[index];

    // }

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