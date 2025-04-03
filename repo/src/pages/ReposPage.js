import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ReposPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        console.log(`Fetching data for user: ${username}`);
        
        // Fetch user info with better error handling
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        
        // Check for rate limiting
        if (userResponse.status === 403) {
          const rateLimitInfo = userResponse.headers.get('X-RateLimit-Remaining') || 'unknown';
          throw new Error(`GitHub API rate limit reached. Remaining requests: ${rateLimitInfo}. Try again later or use a personal access token.`);
        }
        
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error(`User "${username}" not found. Please check the username and try again.`);
          }
          throw new Error(`Error fetching user data. Status: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        console.log("User data fetched successfully:", userData.login);
        setUserInfo(userData);

        // Fetch user repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
        
        // Check for rate limiting again
        if (reposResponse.status === 403) {
          const rateLimitInfo = reposResponse.headers.get('X-RateLimit-Remaining') || 'unknown';
          throw new Error(`GitHub API rate limit reached. Remaining requests: ${rateLimitInfo}. Try again later or use a personal access token.`);
        }
        
        if (!reposResponse.ok) {
          throw new Error(`Failed to fetch repositories. Status: ${reposResponse.status}`);
        }
        
        const reposData = await reposResponse.json();
        console.log(`Fetched ${reposData.length} repositories`);
        setRepos(reposData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [username]);

  const handleAnalyzeRepo = (repoName) => {
    navigate(`/analysis/${username}/${repoName}`);
  };

  if (loading) {
    return (
      <div className="App-header">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>></span> <span>Repositories</span>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="App-header">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>></span> <span>Repositories</span>
      </div>

      <div className="repo-list-container">
        <h1>Repositories for {userInfo?.name || username}</h1>
        
        {userInfo && (
          <div className="user-info">
            <p>Public Repositories: {userInfo.public_repos}</p>
            <p>Followers: {userInfo.followers}</p>
          </div>
        )}
        
        {repos.length > 0 ? (
          <ul className="repo-list">
            {repos.map((repo) => (
              <li key={repo.id} className="repo-item">
                <div className="repo-info">
                  <h3>{repo.name}</h3>
                  <p>{repo.description || 'No description available'}</p>
                  <div className="repo-meta">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>📄 {repo.language || 'Not specified'}</span>
                    <span>🕒 {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  className="analyze-button" 
                  onClick={() => handleAnalyzeRepo(repo.name)}
                >
                  Analyze
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No repositories found</p>
        )}
      </div>
    </div>
  );
}

export default ReposPage;
