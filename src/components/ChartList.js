import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area,
} from 'recharts';

function ChartsList() {
    const [chartData, updateChartData] = useState([])
    useEffect(() => {
        fetchChartData()
    }, [])
    async function fetchChartData() {
        try {
            const request = await axios.get('https://api.worldbank.org/v2/countries/IN/indicators/NY.GDP.MKTP.KD.ZG?per_page=30&MRV=30&format=json')
            updateChartData(request.data[1]);
        } catch (error) {
            console.log(error)
        }
    }
    function renderBarChartData(barChartData) {
        return (
            <BarChart
                width={850}
                height={350}
                data={barChartData}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gdp" fill="#6f42c1" name="GDP of India" />
            </BarChart>
        )
    }
    function renderAreaChartData(chartData) {
        return (
            <AreaChart
                width={850}
                height={350}
                data={chartData}
                margin={{
                    top: 10, right: 30, left: 20, bottom: 0,
                }}
            // isAnimationActive={true} // Enable animation
            // animationBegin={1} // Start animation from the beginning
            // animationDuration={4000} // Animation duration in milliseconds
            // animationEasing="ease-in" // Animation easing function
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="gdp" stroke="#6f42c1" fill="#6f42c1" name="GDP of India" />
            </AreaChart>
        )
    }
    function renderChartData() {
        if (chartData.length) {
            const chartGenData = chartData.map((item) => {
                return {
                    'name': item.date,
                    'gdp': item.value
                }
            }).reverse();
            return (
                <div className="d-flex flex-column align-items-center mt-2">
                    {renderBarChartData(chartGenData)}
                    {renderAreaChartData(chartGenData)}
                </div>
            )
        }
    }
    return (
        <div className="container">
            {renderChartData()}
        </div>
    );
}

export default ChartsList;