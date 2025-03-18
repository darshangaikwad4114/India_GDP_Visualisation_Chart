import React from 'react';
import PropTypes from 'prop-types';
import './Chart.css';

function Chart({ title, children, description }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        {description && <p className="chart-description">{description}</p>}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
}

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string
};

export default Chart;
