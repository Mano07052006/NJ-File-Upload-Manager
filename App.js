// client/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Backend URL

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/files`);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload selected files
  const handleUpload = async () => {
    if (!selectedFiles.length) return alert("Please select files to upload");
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    try {
      const res = await axios.post(`${BASE_URL}/upload`, formData);
      console.log(res.data);
      alert("Upload successful!");
      setSelectedFiles([]);
      fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err.response ? err.response.data : err);
      alert("Upload failed. Check console.");
    }
  };

  // Delete a file
  const handleDelete = async filename => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      const res = await axios.delete(`${BASE_URL}/delete/${filename}`);
      console.log(res.data);
      fetchFiles();
    } catch (err) {
      console.error("Delete failed:", err.response ? err.response.data : err);
      alert("Delete failed. Check console.");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>📁 File Upload Manager</h1>

      {/* Upload Section */}
      <input
        type="file"
        multiple
        onChange={e => setSelectedFiles([...e.target.files])}
      />
      <button onClick={handleUpload} style={{ marginLeft: 10 }}>
        Upload
      </button>

      {/* Uploaded Files List */}
      <h2>Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size (bytes)</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.filename}>
                <td>{file.filename}</td>
                <td>{file.size}</td>
                <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                <td>
                  <a
                    href={`${BASE_URL}/download/${file.filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button>Download</button>
                  </a>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    style={{ marginLeft: 10 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
