import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AvailableInsights from './components/AvailableInsights';
import UploadUserData from './components/UploadUserData';
import GenerateUserDataInsights from './components/GenerateUserDataInsights';
import GetPredictions from './components/GetPredictions';

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/available-insights" element={<AvailableInsights />} />
                <Route path="/upload-user-data" element={<UploadUserData />} />
                <Route path="/generate_user_data_insights" element={<GenerateUserDataInsights />} />
                <Route path="/get-predictions" element={<GetPredictions />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
