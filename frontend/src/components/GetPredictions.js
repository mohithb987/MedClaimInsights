import React, { useState } from 'react';
import axios from 'axios';

const GetPredictions = () => {
    const [predictionType, setPredictionType] = useState('');
    const [datasetOption, setDatasetOption] = useState('');
    const [predictionResult, setPredictionResult] = useState('');
    const [formData, setFormData] = useState({
        Amount: 0,
        Age: '',
        Gender: '',
        MaritalStatus: '',
        Insurance: '',
        Severity: '',
        Specialty: '',
        PrivateAttorney: '',
    });

    const clearPredictionResult = () => {
        setPredictionResult('');
    };
    const handleDatasetOptionChange = e => {
        setDatasetOption(e.target.value);
    };

    const handlePredictionTypeChange = e => {
        setPredictionType(e.target.value);
        setFormData({
            Amount: null,
            Age: '',
            Gender: '',
            MaritalStatus: '',
            Insurance: '',
            Severity: '',
            Specialty: '',
            PrivateAttorney: '',
        });
        clearPredictionResult();
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        try {
            const fileInput = e.target.files[0];
            const formData = new FormData();
            formData.append('file', fileInput);

            const response = await axios.post('http://localhost:5000/api/upload_user_data_backend', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log('File uploaded successfully');
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let apiRoute = '';
            let logMessage = '';
            let dataToSend = {};
            if (predictionType === 'privateAttorneyPrediction') {
                apiRoute = 'http://localhost:5000/predict_private_attorney';
                logMessage = `Private Attorney Prediction using ${datasetOption} dataset`;
                dataToSend = {
                    Amount: parseInt(formData.Amount),
                    Age: parseInt(formData.Age),
                    Gender: formData.Gender,
                    MaritalStatus: parseInt(formData.MaritalStatus),
                    Insurance: formData.Insurance,
                    Severity: parseInt(formData.Severity),
                    Specialty: formData.Specialty,
                    Dataset: datasetOption
                };
            } else if (predictionType === 'claimAmountRangePrediction') {
                apiRoute = 'http://localhost:5000/predict_claim_amount';
                logMessage = `Claim Amount Prediction using ${datasetOption} dataset`;
                dataToSend = {
                    Severity: parseInt(formData.Severity),
                    Specialty: formData.Specialty,
                    Insurance: formData.Insurance,
                    Gender: formData.Gender,
                    Dataset: datasetOption
                };
            }

            console.log(logMessage, dataToSend);
            const response = await axios.post(apiRoute, dataToSend);
            if (response.status === 200) {
                const data = response.data;
                setPredictionResult(data);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const specialtyOptions = [
        'Family Practice',
        'OBGYN',
        'Cardiology',
        'Pediatrics',
        'Internal Medicine',
        'Anesthesiology',
        'Emergency Medicine',
        'Ophthamology',
        'Urological Surgery',
        'Neurology/Neurosurgery',
        'Occupational Medicine',
        'Resident',
        'Thoracic Surgery',
        'General Surgery',
        'Dermatology',
        'Orthopedic',
        'Radiology',
        'Pathology',
        'Plastic surgeon',
        'Physical Medicine',
    ];

    const genderOptions = ['Male', 'Female'];
    const maritalStatusOptions = [...Array(11).keys()].map(num => num.toString());
    const insuranceOptions = [
        'Private',
        'No Insurance',
        'Unknown',
        'Medicare/Medicaid',
        'Workers Compensation',
    ];
    const severityOptions = [...Array(10).keys()].map(num => (num + 1).toString());
    const datasetOptions = ['Available dataset', 'Upload dataset'];
    return (
        <div style={{paddingLeft:'15px', marginTop: '-100px', background: 'linear-gradient(to right, lavender, lightyellow)'}}>
            <h1 style={{paddingTop: '100px', marginBottom: '100px', textAlign:'center', color:'blue'}}>Get Predictions</h1>
                <div  style={{
                    padding: '5px',
                    marginBottom: '10px',
                    height: '300px',
                    marginTop:'-50px'
                }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                        type="radio"
                        value="privateAttorneyPrediction"
                        checked={predictionType === 'privateAttorneyPrediction'}
                        onChange={e => {
                            if (predictionType !== 'privateAttorneyPrediction') {
                                handlePredictionTypeChange(e);
                            }
                        }}
                    />
                    Predict if private attorney will be involved
                </label>
                {predictionType === 'privateAttorneyPrediction' && (
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginLeft: '45px', marginTop: '40px' }}>
                            <div style={{ marginBottom: '10px', display: 'block'}}>
                                <label>Select the Dataset to be used:</label>
                                <select
                                    name="DatasetOption"
                                    value={datasetOption}
                                    onChange={handleDatasetOptionChange}
                                    style={{marginLeft: '15px' }}
                                >
                                    <option value=""/>
                                    {datasetOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))
                                    }
                                </select>
                                {datasetOption === 'Upload dataset' && (
                                        <input type="file" onChange={handleFileUpload} style={{marginLeft: '15px'}} />
                                )}
                            </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                <label>Enter the Claim Amount:</label>
                                <input
                                    type="number"
                                    name="Amount"
                                    value={formData.Amount}
                                    onChange={handleInputChange}
                                    placeholder=""
                                    style={{marginLeft: '58px' }}
                                />
                            </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Patient's Age: </label>
                                <select
                                    name="Age"
                                    value={formData.Age}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '87px' }}
                                >
                                    {[...Array(101).keys()].map(num => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Patient's Gender: </label>
                                <select
                                    name="Gender"
                                    value={formData.Gender}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '63px' }}
                                >
                                    <option value=""/>
                                    {genderOptions.map((gender, index) => (
                                        <option key={index} value={gender}>
                                            {gender}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Patient's Marital Status:</label>
                                <select
                                    name="MaritalStatus"
                                    value={formData.MaritalStatus}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '22px' }}
                                >
                                    <option value=""/>
                                    {maritalStatusOptions.map((status, index) => (
                                        <option key={index} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Patient's Insurance Type: </label>
                                <select
                                    name="Insurance"
                                    value={formData.Insurance}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '7px' }}
                                >
                                    <option value=""/>
                                    {insuranceOptions.map((insurance, index) => (
                                        <option key={index} value={insurance}>
                                            {insurance}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Severity of condition:</label>
                                <select
                                    name="Severity"
                                    value={formData.Severity}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '42px' }}
                                >
                                    <option value=""/>
                                    {severityOptions.map((severity, index) => (
                                        <option key={index} value={severity}>
                                            {severity}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter the Medical Specialty: </label>
                                <select
                                    name="Specialty"
                                    value={formData.Specialty}
                                    onChange={handleInputChange}
                                    style={{marginLeft: '31px' }}
                                >
                                    <option value=""/>
                                    {specialtyOptions.map((specialty, index) => (
                                        <option key={index} value={specialty}>
                                            {specialty}
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </div>
                            <button type="submit" style={{ marginLeft: '45px' }}>Submit</button>
                        </form>
                    </div>
                )}
                    {predictionType === 'privateAttorneyPrediction' && predictionResult && (
                        <div style={{paddingLeft:'15px', marginTop:'30px', marginLeft:'30px', paddingTop:'10px', paddingBottom:'10px', border:'red', borderStyle:'dashed', width:'800px', position:'center'}}>
                            <h2 style={{color: 'forestgreen'}}>Prediction Result:</h2>
                            <pre style={{ whiteSpace: 'pre-wrap', marginLeft: '10px', fontFamily: 'inherit', textAlign: 'left', color: 'maroon' }}>{predictionResult}</pre>
                        </div>
                    )}
            </div>
                <br />
            <div style={{
                marginTop: '300px',
                height:'630px'
            }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                        type="radio"
                        value="claimAmountRangePrediction"
                        checked={predictionType === 'claimAmountRangePrediction'}
                        onChange={e => {
                            if (predictionType !== 'claimAmountRangePrediction') {
                                handlePredictionTypeChange(e);
                            }
                        }}
                    />
                    Predict the claim amount
                </label>
                    {predictionType === 'claimAmountRangePrediction' && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginLeft: '45px', marginTop: '40px' }}>
                                    <div style={{ marginBottom: '10px', display: 'block'}}>
                                        <label>Select the Dataset to be used:</label>
                                        <select
                                            name="DatasetOption"
                                            value={datasetOption}
                                            onChange={handleDatasetOptionChange}
                                            style={{marginLeft: '15px' }}
                                        >
                                            <option value=""/>
                                            {datasetOptions.map((option, index) => (
                                                <option key={index} value={option}>
                                                    {option}
                                                </option>
                                            ))
                                            }
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '10px', display: 'block'}}>
                                        <label>Enter Severity of condition:</label>
                                        <select
                                            name="Severity"
                                            value={formData.Severity}
                                            onChange={handleInputChange}
                                            style={{marginLeft: '42px' }}
                                        >
                                            <option value=""/>
                                            {severityOptions.map((severity, index) => (
                                                <option key={index} value={severity}>
                                                    {severity}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '10px', display: 'block'}}>
                                        <label>Enter the Medical Specialty: </label>
                                        <select
                                            name="Specialty"
                                            value={formData.Specialty}
                                            onChange={handleInputChange}
                                            style={{marginLeft: '31px' }}
                                        >
                                            <option value=""/>
                                            {specialtyOptions.map((specialty, index) => (
                                                <option key={index} value={specialty}>
                                                    {specialty}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                <div style={{ marginBottom: '10px', display: 'block'}}>
                                    <label>Enter Patient's Insurance Type: </label>
                                    <select
                                        name="Insurance"
                                        value={formData.Insurance}
                                        onChange={handleInputChange}
                                        style={{marginLeft: '7px' }}
                                    >
                                        <option value=""/>
                                        {insuranceOptions.map((insurance, index) => (
                                            <option key={index} value={insurance}>
                                                {insurance}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                    <div style={{ marginBottom: '10px', display: 'block'}}>
                                        <label>Enter Patient's Gender: </label>
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleInputChange}
                                            style={{marginLeft: '63px' }}
                                        >
                                            <option value=""/>
                                            {genderOptions.map((gender, index) => (
                                                <option key={index} value={gender}>
                                                    {gender}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" style={{ marginLeft: '45px' }}>Submit</button>
                            </form>
                    )}

            {predictionType === 'claimAmountRangePrediction' && predictionResult && (
                <div style={{paddingLeft:'15px', marginTop:'30px', marginLeft:'30px', paddingTop:'10px', paddingBottom:'10px', border:'red', borderStyle:'dashed', width:'800px', position:'center'}}>
                    <h2 style={{color: 'forestgreen'}}>Prediction Result:</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', marginLeft: '10px', fontFamily: 'inherit', textAlign: 'left', color: 'maroon' }}>{predictionResult}</pre>
                </div>
            )}
            </div>
        </div>
    );
};
export default GetPredictions;