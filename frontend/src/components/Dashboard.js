import React from 'react';
import { Card, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../images/background.jpeg';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleUserDatasetInsights = () => {
        navigate('/upload-user-data');
    };

    const handleAvailableInsights = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/generate_insights');
            navigate('/available-insights');
        } catch (error) {
            console.error('Error fetching insights:', error);
        }
    };

    const handleGetPredictions = () => {
        navigate('/get-predictions');
    };

    return (
        <div
            className="dashboard-container"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
        }}
        >
            <div style={{ maxWidth: '600px' }}>
                <h1 style={{color: "brown",  padding: '5px'}}>MedClaim Insights Dashboard</h1>
                <Card title="Generate Insights from User's Dataset" style={{ marginBottom: '20px' }}>
                    <Button type="primary" onClick={handleUserDatasetInsights}>
                        Generate Insights
                    </Button>
                </Card>

                <Card title="Explore Available Insights" style={{ marginBottom: '20px' }}>
                    <Button type="primary" onClick={handleAvailableInsights}>
                        Explore Insights
                    </Button>
                </Card>

                <Card title="Get Predictions">
                    <Button type="primary" onClick={handleGetPredictions}>
                        Get Predictions
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;