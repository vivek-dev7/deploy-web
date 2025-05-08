import React from 'react';
import Chart from 'react-apexcharts';

const SparklineChart = ({ data, color, width = 100, height = 35 }) => {
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? '#00b37e' : '#f75a68');
  
  const chartOptions = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [lineColor]
    },
    tooltip: {
      enabled: false
    },
    grid: {
      show: false
    },
    xaxis: {
      labels: {
        show: false
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      show: false
    }
  };

  const series = [{
    name: 'Price',
    data: data
  }];

  return (
    <div className="stock-sparkline">
      <Chart 
        options={chartOptions} 
        series={series} 
        type="line" 
        width={width} 
        height={height}
      />
    </div>
  );
};

export default SparklineChart;