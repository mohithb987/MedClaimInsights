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
                background: 'linear-gradient(to right, lightblue, lightyellow)'
            }}
        >
            <div style={{ flex: 1 }}>
                <img src={`data:image/png;base64, ${plotBase64}`} alt={`Insights Plot ${index}`} />
            </div>
            <div style={{ flex: 1, paddingLeft: '10px', textAlign: 'center' }}>
                <p style={{ textAlign: 'center', marginTop:'-300px',fontWeight: 'bold' }}>DESCRIPTION</p>
                <p style={{ textAlign: 'left', marginTop: '50px', marginLeft: '50px', marginRight:'50px'}}>{formattedDescription}</p>
            </div>
        </div>
    );
};

const GenerateUserDataInsights = () => {
    const [plotData, setPlotData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/generate_user_data_insights');
                const { plotBase64, descriptions, titles } = response.data;

                const plots = plotBase64.map((plot, index) => ({
                    plotBase64: plot,
                    description: descriptions[index],
                    title: titles[index]
                }));

                setPlotData(plots);
            } catch (error) {
                console.error('Error fetching insights:', error);
            }
        };

        fetchInsights();
    }, []);

    const handleSelectChange = (event) => {
        const selectedIndex = parseInt(event.target.value);
        setSelectedItem(selectedIndex);
    };

    return (
        <div style={{ background: 'linear-gradient(to right, lavender, white)', height: '100vh', width: '100vw', padding: '20px' }}>
            <h1 style={{ color: 'Darkviolet', textAlign: 'center', paddingBottom: '80px' }}>User Data Insights</h1>
            <p style={{ textAlign: 'left', paddingBottom: '30px' }}>
                This page serves as a visual representation of the dataset you have uploaded, offering insightful plots that provide a comprehensive view of the data distribution and correlations between various features.
            </p>
            <label> Please select the plot you would like to view:</label>
            <select onChange={handleSelectChange} style={{ marginLeft: '30px', height: '30px' }}>
                <option value={null}>Select Graph</option>
                {plotData.map((plot, index) => (
                    <option key={index} value={index}>
                        {plot.title}
                    </option>
                ))}
            </select>
            {selectedItem !== null && (
                <div style={{ marginTop: '60px' }}>
                    <InsightImage
                        key={selectedItem}
                        plotBase64={plotData[selectedItem].plotBase64}
                        index={selectedItem}
                        description={plotData[selectedItem].description}
                    />
                </div>
            )}
        </div>
    );
};

export default GenerateUserDataInsights;
