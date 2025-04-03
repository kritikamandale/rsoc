import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate input URL
    if (!inputUrl.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    try {
      // Extract username and potential repo from URL
      const urlParts = inputUrl
        .replace('https://', '')
        .replace('http://', '')
        .replace('github.com/', '')
        .split('/');
      
      const username = urlParts[0];

      if (!username) {
        setError('Invalid GitHub URL');
        return;
      }

      // If URL points directly to a repo, go to analysis page
      if (urlParts.length > 1 && urlParts[1]) {
        navigate(`/analysis/${username}/${urlParts[1]}`);
      } else {
        // Otherwise, go to repos page
        navigate(`/repos/${username}`);
      }
    } catch (error) {
      setError('Error processing URL. Please try again.');
    }
  };

  return (
    <div className="App-header">
      <div className="home-container">
        <h1>GitHub Repository Analyzer</h1>
        <p>
          Welcome to the GitHub Repository Analyzer! This tool helps you understand
          repository activity, contributor patterns, and overall health metrics
          to gain valuable insights into any GitHub project.
        </p>
        <p>
          Enter a GitHub profile URL to browse repositories or enter a specific
          repository URL to analyze it directly.
        </p>
        <form className="url-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="url-input"
            placeholder="Enter GitHub URL (e.g., https://github.com/facebook or https://github.com/facebook/react)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="url-submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
