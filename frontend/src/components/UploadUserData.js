import React, { useState } from 'react';
import { Card, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadUserData = () => {
    const [fileList, setFileList] = useState([]);
    const handleUpload = async () => {
        const formData = new FormData();
        fileList.forEach(file => {
            formData.append('file', file, file.name);
        });

        try {
            const response = await axios.post('http://localhost:5000/api/upload_user_data_backend', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload successful:', response.data);
            message.success('File uploaded successfully');

            setTimeout(() => {
                window.location.href = '/generate_user_data_insights';
            }, 2000);

        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('File upload failed');
        }
    };

    const uploadProps = {
        onRemove: file => {
            setFileList(prevList => prevList.filter(item => item.uid !== file.uid));
        },
        beforeUpload: file => {
            setFileList(prevList => [...prevList, file]);
            return false;
        },
        fileList
    };

    return (
        <div>
            <h1>Upload Custom Dataset</h1>
            <Card title="Upload CSV File" style={{ width: 500 }}>
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                <Button type="primary" style={{ marginTop: '10px' }} onClick={handleUpload}>
                    Upload
                </Button>
            </Card>
        </div>
    );
};

export default UploadUserData;
