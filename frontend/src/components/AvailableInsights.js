import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InsightImage = ({ plotBase64, index, description }) => {
    const formattedDescription = description.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            <br />
        </React.Fragment>
    ));

    return (
        <div
            key={index}
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                border: '3px solid darkblue',
                padding: '5px',
                marginBottom: '10px',
                background: 'linear-gradient(to right, skyblue, lightpink)'
            }}
        >
            <div style={{ flex: 1 }}>
                <img src={`data:image/png;base64, ${plotBase64}`} alt={`Insights Plot ${index}`} />
            </div>
            <div style={{ flex: 1, paddingLeft: '10px', textAlign: 'left' }}>
                <p style={{ textAlign: 'center', marginTop:'-300px',fontWeight: 'bold' }}>DESCRIPTION</p>
                <p style={{ marginTop: '50px', marginLeft: '50px', marginRight:'50px'}}>{formattedDescription}</p>
            </div>
        </div>
    );
};

const AvailableInsights = () => {
    const [plotData, setPlotData] = useState([]);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/generate_insights');
                const { plotBase64, descriptions } = response.data;

                const plots = plotBase64.map((plot, index) => ({
                    plotBase64: plot,
                    description: descriptions[index],
                }));

                setPlotData(plots);
            } catch (error) {
                console.error('Error fetching insights:', error);
            }
        };

        fetchInsights();
    }, []);

    return (
        <div>
            <h1 style={{ color: 'Darkorange', textAlign: 'center' }}>Available Insights Page</h1>
            <p style={{ textAlign: 'left' }}>This page provides a few visualization plots of the dataset we have, to give you an insight into the shape of data distribution, and a comprehensive understanding of how the features are related to each other.</p>
            {plotData.map((plot, index) => (
                <InsightImage
                    key={index}
                    plotBase64={plot.plotBase64}
                    index={index}
                    description={plot.description}
                />
            ))}
        </div>
    );
};

export default AvailableInsights;
