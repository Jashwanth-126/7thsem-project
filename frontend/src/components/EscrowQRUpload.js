import React, { useState, useEffect } from 'react';
import API from '../services/api';

const EscrowQRUpload = () => {
  const [file, setFile] = useState(null);
  const [currentQR, setCurrentQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCurrentQR = async () => {
    try {
      const response = await API.get('/api/payment/admin/escrow-qr');
      if (response.data.success) {
        setCurrentQR(response.data.qr_url);
      }
    } catch (error) {
      console.error('FETCH QR ERROR:', error);
    }
  };

  useEffect(() => {
    fetchCurrentQR();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('escrow_qr', file);

    try {
      const response = await API.post('/api/payment/admin/upload-escrow-qr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage('Escrow QR updated successfully!');
        setCurrentQR(response.data.qr_url);
        setFile(null);
      } else {
        setMessage('Failed to upload QR.');
      }
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      setMessage('Error uploading QR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-lg">
      <h2 className="text-3xl font-bold text-green-700 mb-6">Admin Escrow QR Management</h2>
      
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* CURRENT QR PREVIEW */}
        <div className="flex-1">
          <p className="text-gray-600 font-semibold mb-3">Current Active Escrow QR:</p>
          {currentQR ? (
            <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-green-200 inline-block">
              <img 
                src={currentQR} 
                alt="Current Escrow QR" 
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-sm">No active QR</p>
            </div>
          )}
        </div>

        {/* UPLOAD SECTION */}
        <div className="flex-1 w-full">
          <p className="text-gray-600 font-semibold mb-3">Upload New Escrow QR:</p>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="escrow-qr-input"
              />
              <label
                htmlFor="escrow-qr-input"
                className="cursor-pointer block w-full bg-green-50 hover:bg-green-100 border-2 border-dashed border-green-300 text-green-700 p-8 rounded-2xl text-center transition-all group-hover:border-green-500"
              >
                {file ? (
                  <span className="font-medium text-green-800">{file.name}</span>
                ) : (
                  <>
                    <span className="block text-2xl mb-2">📸</span>
                    <span className="font-medium">Click to select QR Image</span>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all ${
                loading || !file 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-200'
              }`}
            >
              {loading ? 'Uploading...' : 'Update Escrow QR'}
            </button>

            {message && (
              <p className={`text-center font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EscrowQRUpload;
