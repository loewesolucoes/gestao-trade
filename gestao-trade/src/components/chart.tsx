"use client";
import { useEffect, useRef } from 'react';
import { CrosshairMode, LineStyle, createChart } from 'lightweight-charts';
import moment from 'moment';
import { useEnv } from '../contexts/env';
import { NotificationUtil } from '../utils/notification';

export interface ChartIntraday {
  time: string,
  open?: number,
  close?: number,
  high?: number,
  low?: number,
}

export interface Analise {
  fibos: ChartFiboLines[]
  toposEFundos: ToposEFundos[]
}

export interface ToposEFundos {
  index: number;
  order: number;
  date: Date;
  data: ToposEFundosData;
  type: string;
}

export interface ToposEFundosData {
  id: number;
  codigo: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
  intervalo: number;
  createdDate: Date;
  updatedDate: null;
  type: string;
}


export interface ChartFiboLines {
  fibo0: number
  fibo382: number
  fibo618: number
  fibo50: number
  fibo1000: number
  dataInicio: Date
  dataFim: Date
  movements: any[]
}

interface CustomProps {
  data: ChartIntraday[],
  analysis: Analise,
  className?: string,
  visibleFrom?: string,
  visibleTo?: string,
  options: { showFibo: boolean, showMovements: boolean, showToposEFundos: boolean }
}

let chart: import('lightweight-charts').IChartApi;

export const ChartComponent = (props: CustomProps) => {
  const { data, analysis, visibleFrom, visibleTo, options, ...otherProps } = props;

  const chartContainerRef = useRef() as any;

  useEffect(() => {
    if (data == null) return;

    reinitCharts();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data]);

  useEffect(() => {
    const candleSeries = reinitCharts();

    if (options.showFibo) createFiboCharts();

    if (options.showMovements) createMovementsCharts();

    if (options.showToposEFundos) createToposEFundos(candleSeries);
  }, [options]);

  function reinitCharts(): import('lightweight-charts').ISeriesApi<"Candlestick", import('lightweight-charts').Time> {
    if (chart != null) {
      chartContainerRef.current.innerHTML = "";
    }

    const candleSeries = createChartWithCandle();
    setVisibleRange();

    return candleSeries;
  }

  function handleResize() {
    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
  };

  function createChartWithCandle(): import('lightweight-charts').ISeriesApi<"Candlestick", import('lightweight-charts').Time> {
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

    return candleSeries;
  }

  function createToposEFundos(candleSeries: import('lightweight-charts').ISeriesApi<"Candlestick", import('lightweight-charts').Time>) {
    const { toposEFundos } = analysis
    const markers: import('lightweight-charts').SeriesMarker<import('lightweight-charts').Time>[] = [];
    const currentColor = getRandomColor();

    for (let index = 0; index < toposEFundos.length; index++) {
      const element = toposEFundos[index];

      const isTopo = element.type === 'TOPO';

      markers.push({
        time: moment(element.date).format('YYYY-MM-DD'),
        position: isTopo ? 'aboveBar' : 'belowBar',
        shape: isTopo ? 'arrowDown' : 'arrowUp',
        color: currentColor,
        text: isTopo ? 'T' : 'F',
      })
    }

    candleSeries.setMarkers(markers);
  }

  function createMovementsCharts() {
    const { fibos } = analysis

    for (let index = 0; index < fibos.length; index++) {
      const x = analysis[index];
      const currentColor = getRandomColor();
      const lineSerieFibo0 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo0.setData(x.movements.map(y => ({ time: moment(y.date).format('YYYY-MM-DD'), value: y.low?.plus(y.high?.minus(y.low).div(2))?.toNumber() })));
    }
  }

  function createFiboCharts() {
    const { fibos } = analysis

    for (let index = 0; index < fibos.length; index++) {
      const x = analysis[index];
      const currentColor = getRandomColor();

      const lineSerieFibo0 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Solid,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo0.setData([
        { time: moment(x.dataInicio).format('YYYY-MM-DD'), value: x.fibo0 },
        { time: moment(x.dataFim).format('YYYY-MM-DD'), value: x.fibo0 },
      ]);
      const lineSerieFibo382 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo382.setData([
        { time: moment(x.dataInicio).format('YYYY-MM-DD'), value: x.fibo382 },
        { time: moment(x.dataFim).format('YYYY-MM-DD'), value: x.fibo382 },
      ]);
      const lineSerieFibo618 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo618.setData([
        { time: moment(x.dataInicio).format('YYYY-MM-DD'), value: x.fibo618 },
        { time: moment(x.dataFim).format('YYYY-MM-DD'), value: x.fibo618 },
      ]);
      const lineSerieFibo50 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Dotted,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo50.setData([
        { time: moment(x.dataInicio).format('YYYY-MM-DD'), value: x.fibo50 },
        { time: moment(x.dataFim).format('YYYY-MM-DD'), value: x.fibo50 },
      ]);
      const lineSerieFibo1000 = chart.addLineSeries({
        color: currentColor,
        lineStyle: LineStyle.Solid,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSerieFibo1000.setData([
        { time: moment(x.dataInicio).format('YYYY-MM-DD'), value: x.fibo1000 },
        { time: moment(x.dataFim).format('YYYY-MM-DD'), value: x.fibo1000 },
      ]);
    }
  }

  useEffect(() => {
    setVisibleRange();
  }, [visibleFrom, visibleTo]);

  function setVisibleRange() {
    if (visibleFrom == null || visibleTo == null || data?.length === 0)
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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}