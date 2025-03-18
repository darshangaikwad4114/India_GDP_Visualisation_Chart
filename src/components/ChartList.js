import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, Line, ComposedChart, ReferenceLine
} from 'recharts';
import Chart from './Chart';
import './ChartList.css';

function ChartsList({ darkMode }) {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentYear, setCurrentYear] = useState(null);
    const [showInsights, setShowInsights] = useState(true);
    
    // Define colors for the charts - matching our theme with dark mode support
    const COLORS = darkMode ? 
        ['var(--chart-color-1)', 'var(--chart-color-2)', 'var(--chart-color-3)', 'var(--chart-color-4)', 'var(--chart-color-5)'] : 
        ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'];
    
    useEffect(() => {
        fetchChartData();
    }, []);
    
    async function fetchChartData() {
        setIsLoading(true);
        try {
            const request = await axios.get('https://api.worldbank.org/v2/countries/IN/indicators/NY.GDP.MKTP.KD.ZG?per_page=30&MRV=30&format=json');
            
            if (request.data && request.data[1]) {
                const formattedData = request.data[1].map((item) => ({
                    'name': item.date,
                    'gdp': parseFloat(item.value.toFixed(2)),
                    'quarter': Math.floor(Math.random() * 4) + 1, // Simulated quarterly data
                })).reverse();
                
                setChartData(formattedData);
                
                // Find latest year with data
                const latestYear = formattedData[formattedData.length - 1];
                if (latestYear) {
                    setCurrentYear(latestYear);
                }
            }
        } catch (error) {
            console.error("Error fetching GDP data:", error);
            setError("Failed to load GDP data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }
    
    // Calculate year-on-year growth
    const calculateYoYGrowth = () => {
        if (chartData.length < 2) return 0;
        const currentGDP = chartData[chartData.length - 1].gdp;
        const previousGDP = chartData[chartData.length - 2].gdp;
        return ((currentGDP - previousGDP) / Math.abs(previousGDP) * 100).toFixed(2);
    };
    
    // Calculate average growth for last N years
    const calculateAverageGrowth = (years = 5) => {
        if (chartData.length < years) return 0;
        const lastNYears = chartData.slice(-years);
        const sum = lastNYears.reduce((acc, curr) => acc + curr.gdp, 0);
        return (sum / years).toFixed(2);
    };
    
    // Find maximum and minimum GDP values
    const findExtremeValues = () => {
        if (!chartData.length) return { max: 0, min: 0, maxYear: '', minYear: '' };
        
        const max = chartData.reduce((max, item) => 
            item.gdp > max.gdp ? item : max, chartData[0]);
        
        const min = chartData.reduce((min, item) => 
            item.gdp < min.gdp ? item : min, chartData[0]);
            
        return {
            max: max.gdp,
            min: min.gdp,
            maxYear: max.name,
            minYear: min.name
        };
    };
    
    // Export data as CSV
    const exportCSV = () => {
        if (!chartData.length) return;
        
        const headers = ['Year', 'GDP Growth (%)'];
        const csvContent = [
            headers.join(','),
            ...chartData.map(item => `${item.name},${item.gdp}`)
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'india_gdp_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-year">{`Year: ${label}`}</p>
                    <p className="tooltip-value">{`GDP Growth: ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };
    
    const extremeValues = findExtremeValues();
    const yoyGrowth = calculateYoYGrowth();
    const averageGrowth = calculateAverageGrowth(5);
    
    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading GDP data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchChartData}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="dashboard-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="dashboard-title">
                        <h1 className="dashboard-heading">India's GDP Growth Analysis</h1>
                        <p className="dashboard-subtitle">Analyzing trends from {chartData[0]?.name} to {chartData[chartData.length - 1]?.name}</p>
                    </div>
                    <div className="dashboard-actions">
                        <div className="insight-toggle">
                            <button 
                                className={`insight-btn ${showInsights ? 'active' : ''}`}
                                onClick={() => setShowInsights(!showInsights)}
                                aria-label={showInsights ? "Hide insights" : "Show insights"}
                            >
                                <i className="bi bi-lightbulb-fill me-2"></i>
                                {showInsights ? 'Hide Insights' : 'Show Insights'}
                            </button>
                        </div>
                        <button 
                            className="export-btn" 
                            onClick={exportCSV}
                            aria-label="Export data"
                        >
                            <i className="bi bi-download me-2"></i>
                            Export
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-3">
                    <div className="data-card">
                        <h5 className="card-subtitle text-muted">Latest GDP Growth</h5>
                        <div className="data-value pulse">{currentYear ? currentYear.gdp : 0}%</div>
                        <div className={`data-trend ${parseFloat(yoyGrowth) >= 0 ? 'data-trend-up' : 'data-trend-down'}`}>
                            <i className={`bi ${parseFloat(yoyGrowth) >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`}></i>
                            {yoyGrowth}% YoY
                        </div>
                        <p className="card-text text-muted">Year: {currentYear ? currentYear.name : ''}</p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="data-card">
                        <h5 className="card-subtitle text-muted">5-Year Average</h5>
                        <div className="data-value">{averageGrowth}%</div>
                        <p className="card-text text-muted">
                            <i className="bi bi-calendar3 me-1"></i> 
                            Period: {chartData.length ? `${chartData[chartData.length - 5]?.name || ''} - ${chartData[chartData.length - 1]?.name || ''}` : ''}
                        </p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="data-card">
                        <h5 className="card-subtitle text-muted">Highest Growth</h5>
                        <div className="data-value">{extremeValues.max}%</div>
                        <p className="card-text text-muted">
                            <i className="bi bi-calendar3 me-1"></i> Year: {extremeValues.maxYear}
                        </p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="data-card">
                        <h5 className="card-subtitle text-muted">Lowest Growth</h5>
                        <div className="data-value">{extremeValues.min}%</div>
                        <p className="card-text text-muted">
                            <i className="bi bi-calendar3 me-1"></i> Year: {extremeValues.minYear}
                        </p>
                    </div>
                </div>
            </div>
            
            {showInsights && (
                <div className="insight-container mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                                Key Insights
                            </h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <ul className="insight-list">
                                        <li>India's GDP growth has {parseFloat(yoyGrowth) >= 0 ? 'increased' : 'decreased'} by {Math.abs(parseFloat(yoyGrowth))}% year-over-year</li>
                                        <li>Average growth over the last 5 years is {averageGrowth}%</li>
                                        <li>Highest recorded growth was {extremeValues.max}% in {extremeValues.maxYear}</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <ul className="insight-list">
                                        <li>Growth trend appears to be {parseFloat(yoyGrowth) >= 0 ? 'positive' : 'negative'} in recent years</li>
                                        <li>Current GDP growth is {currentYear?.gdp > parseFloat(averageGrowth) ? 'above' : 'below'} the 5-year average</li>
                                        <li>Overall growth pattern shows {parseFloat(calculateAverageGrowth(5)) > parseFloat(calculateAverageGrowth(10)) ? 'acceleration' : 'deceleration'} compared to historical average</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="row g-4">
                <div className="col-12">
                    <Chart 
                        title="GDP Growth Over Time" 
                        description="Annual GDP growth rate (%) year by year"
                    >
                        <ResponsiveContainer width="100%" height={500}>
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--text-color)" 
                                    tick={{ fill: 'var(--text-color)' }}
                                />
                                <YAxis 
                                    stroke="var(--text-color)" 
                                    tick={{ fill: 'var(--text-color)' }}
                                />
                                <Tooltip content={customTooltip} />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36} 
                                    wrapperStyle={{ color: 'var(--text-color)' }}
                                />
                                <Bar 
                                    dataKey="gdp" 
                                    fill={COLORS[0]}
                                    name="GDP Growth (%)" 
                                    animationDuration={1500}
                                    radius={[4, 4, 0, 0]}
                                    className="highlight-bar"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gdp"
                                    stroke={COLORS[1]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Growth Trend"
                                />
                                <ReferenceLine y={0} stroke="var(--gray-400)" />
                                <ReferenceLine 
                                    y={parseFloat(averageGrowth)} 
                                    stroke={COLORS[2]} 
                                    strokeDasharray="3 3"
                                    label={{ 
                                        value: 'Avg', 
                                        position: 'right', 
                                        fill: COLORS[2],
                                        fontSize: 12
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Chart>
                </div>
                
                <div className="col-12">
                    <Chart 
                        title="GDP Growth Trend Analysis" 
                        description="Visualizing the continual trend of India's economic growth over time"
                    >
                        <ResponsiveContainer width="100%" height={500}>
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                                animationDuration={1500}
                            >
                                <defs>
                                    <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--text-color)" 
                                    tick={{ fill: 'var(--text-color)' }}
                                />
                                <YAxis 
                                    stroke="var(--text-color)" 
                                    tick={{ fill: 'var(--text-color)' }}
                                />
                                <Tooltip content={customTooltip} />
                                <ReferenceLine y={0} stroke="var(--gray-400)" />
                                <Area 
                                    type="monotone" 
                                    dataKey="gdp" 
                                    stroke={COLORS[0]} 
                                    fillOpacity={1}
                                    fill="url(#colorGdp)" 
                                    name="GDP Growth (%)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Chart>
                </div>
            </div>
            
            <div className="footer-info text-center my-4">
                <p className="copyright">
                    © {new Date().getFullYear()} India GDP Analysis Dashboard. Data provided by World Bank API.
                </p>
            </div>
        </div>
    );
}

export default ChartsList;