import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryGroup,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
} from 'victory';

const colorSchemes = {
  blue: {
    areaFill: '#acc1d7',
    lineStroke: '#5983b0',
  },
  green: {
    areaFill: '#9fd7a2',
    lineStroke: '#3faf46',
  },
  yellow: {
    areaFill: '#ffe993',
    lineStroke: '#ffd428',
  },
};

const AnnualChart = ({ chartData, color, unitLabel }) => (
  <VictoryChart
    theme={VictoryTheme.material}
    domainPadding={15}
    height={300}
    padding={{ left: 66, bottom: 50, right: 15, top: 15 }}
    style={{ parent: { border: '1px solid #ccc' } }}
  >
    <VictoryLine
      style={{
        data: { stroke: colorSchemes[color].lineStroke },
        parent: { border: '1px solid #ccc' },
      }}
      data={chartData.average}
      interpolation="natural"
    />
    <VictoryGroup>
      <VictoryScatter
        style={{ data: { fill: colorSchemes[color].lineStroke } }}
        data={chartData.average}
        labels={({ datum }) => datum.y}
        labelComponent={
          <VictoryTooltip
            flyoutStyle={{ stroke: colorSchemes[color].lineStroke }}
          />
        }
        size={4}
      />
      <VictoryScatter
        style={{
          data: {
            fill: '#bdbdbd',
            fillOpacity: 0.7,
          },
        }}
        symbol={'minus'}
        data={chartData.annual}
        size={2}
      />
    </VictoryGroup>
    <VictoryAxis
      dependentAxis
      style={{ axisLabel: { padding: 46 } }}
      label={unitLabel}
    />
    <VictoryAxis
      style={{ axisLabel: { padding: 30 } }}
      label="Reservoir Area (Depth = 10 ft)"
    />
  </VictoryChart>
);

export default AnnualChart;
