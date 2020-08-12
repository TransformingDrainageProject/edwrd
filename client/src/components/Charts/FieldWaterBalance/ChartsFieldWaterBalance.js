import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';

import ChartDescription from '../ChartDescription';
import DownloadDataButton from '../DownloadDataButton';
import MonthlyChart from '../MonthlyChart';
import VariableButtons from './VariableButtons';

import chartVariables from './variables';
import updateChartData from '../utils/updateChartData';
import getYearInfo from '../utils/getYearInfo';
import MonthlyOptions from '../MonthlyOptions';

// category keys for different variable subsets (inflow, outflow, other)
const variableClasses = {
  inflow: ['precipitation', 'irrigation', 'upwardFlux'],
  outflow: [
    'cropTranspiration',
    'potentialCropTranspiration',
    'evapotranspiration',
    'potentialEvapotranspiration',
    'soilEvaporation',
    'runoff',
    'tileDrainFlow',
  ],
  other: ['readilyAvailableWater', 'soilMoisture'],
};

const ChartsReservoirWaterBalance = ({ chartData }) => {
  const [active, setActive] = useState([]);
  const [annualFilter, setAnnualFilter] = useState('all');
  const [selectedChartData, updateSelectedChartData] = useState(null);
  const [selectedVol, setSelectedVol] = useState(2);

  useEffect(() => {
    const data = updateChartData(chartData, active, annualFilter, selectedVol);
    updateSelectedChartData(data);
  }, [active, selectedVol]);

  const yearInfo = getYearInfo(chartData, active, selectedVol);
  const uniqueYears = yearInfo.uniqueYears;
  const yearRange = yearInfo.yearRange;

  return (
    <>
      <Row>
        <Col>
          Click on the buttons below to see results for each field water balance
          metric across multiple reservoir sizes.
        </Col>
      </Row>
      <VariableButtons
        active={active}
        annualFilter={annualFilter}
        chartData={chartData}
        selectedVol={selectedVol}
        setActive={setActive}
        updateSelectedChartData={updateSelectedChartData}
      />
      <hr style={{ width: '50%' }} />
      {active.length > 0 && selectedVol ? (
        <>
          <Row className="text-center">
            <Col md={10}>
              <h1>
                {`Reservoir size = ${chartData.rvol[selectedVol]}${
                  chartData.unit_type === 'us' ? 'ac' : 'ha'
                }`}
                {annualFilter !== 'all' ? ` (${annualFilter})` : `${yearRange}`}
              </h1>
              <h2>{`(depth = ${chartData.rdep}${
                chartData.unit_type === 'us' ? 'ft' : 'm'
              })`}</h2>
            </Col>
          </Row>

          <Row className="mb-3 text-center">
            <Col md={10}>
              <MonthlyChart
                active={active}
                annualFilter={annualFilter}
                chartData={selectedChartData}
                datasetNames={chartVariables}
                color="green"
                unitLabel={
                  chartData.unit_type === 'us' ? 'inches' : 'millimeters'
                }
                rdep={chartData.rdep}
                unit_type={chartData.unit_type}
                variableClasses={variableClasses}
              />
            </Col>
            <Col md={2}>
              <MonthlyOptions
                chartData={chartData}
                active={active}
                selectedVol={selectedVol}
                setAnnualFilter={setAnnualFilter}
                updateSelectedChartData={updateSelectedChartData}
                uniqueYears={uniqueYears}
                annualFilter={annualFilter}
                setSelectedVol={setSelectedVol}
              />
            </Col>
          </Row>
        </>
      ) : null}
      <Row>
        <Col>
          <ChartDescription
            name="fieldWaterBalance"
            title="Field Water Balance"
            text="This graph shows the monthly amount of water for each
                  component of the field water balance for a specific
                  reservoir size across all years. Use the buttons at the top
                  right of the graph to view a specific year or reservoir
                  size. Click on the question mark to learn more about how
                  this water balance is calculated."
          />
        </Col>
      </Row>
      <DownloadDataButton sessionID={chartData.sessionID} type="monthly" />
      <DownloadDataButton sessionID={chartData.sessionID} type="annual" />
    </>
  );
};

export default ChartsReservoirWaterBalance;
