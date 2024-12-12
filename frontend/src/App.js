import React, { useState } from "react";
import axios from "axios";

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [coordinates, setCoordinates] = useState({ x_min: 0, y_min: 0, x_max: 0, y_max: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setCoordinates({ ...coordinates, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await axios.post("/api/remove-bg", {
        image_url: imageUrl,
        bounding_box: coordinates,
      });
      setResult(response.data.processed_image_url);
    } catch (err) {
      setError("Failed to process the image");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Background Remover</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        {["x_min", "y_min", "x_max", "y_max"].map((field) => (
          <input
            key={field}
            type="number"
            name={field}
            placeholder={field}
            value={coordinates[field]}
            onChange={handleInputChange}
            required
          />
        ))}
        <button type="submit">Submit</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <img src={result} alt="Processed" />}
    </div>
  );
}

export default App;
