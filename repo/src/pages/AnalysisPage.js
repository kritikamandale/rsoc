import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RepoAnalysis from '../components/RepoAnalysis';

function AnalysisPage() {
  const { username, repo } = useParams();
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyzeRepository = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Analyzing repository: ${username}/${repo}`);
        
        // Fetch basic repo info
        const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        
        // Check for rate limiting
        if (repoResponse.status === 403) {
          const rateLimitInfo = repoResponse.headers.get('X-RateLimit-Remaining') || 'unknown';
          throw new Error(`GitHub API rate limit reached. Remaining requests: ${rateLimitInfo}. Try again later or use a personal access token.`);
        }
        
        if (!repoResponse.ok) {
          if (repoResponse.status === 404) {
            throw new Error(`Repository "${username}/${repo}" not found. Please check the repository name and try again.`);
          }
          throw new Error(`Error fetching repository data. Status: ${repoResponse.status}`);
        }
        
        const repoInfo = await repoResponse.json();
        console.log("Repository info fetched successfully");
        
        // Fetch contributors with error handling
        const contributorsResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contributors?per_page=100`);
        if (contributorsResponse.status === 403) {
          console.warn("Rate limit issue with contributors, continuing with analysis");
        }
        const contributors = contributorsResponse.ok ? await contributorsResponse.json() : [];
        
        // Fetch commits with error handling
        const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100`);
        if (commitsResponse.status === 403) {
          console.warn("Rate limit issue with commits, continuing with analysis");
        }
        const commits = commitsResponse.ok ? await commitsResponse.json() : [];
        
        // Fetch issues with error handling
        const issuesResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/issues?state=all&per_page=100`);
        if (issuesResponse.status === 403) {
          console.warn("Rate limit issue with issues, continuing with analysis");
        }
        const issues = issuesResponse.ok ? await issuesResponse.json() : [];
        
        // Fetch pull requests with error handling
        const prsResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/pulls?state=all&per_page=100`);
        if (prsResponse.status === 403) {
          console.warn("Rate limit issue with pull requests, continuing with analysis");
        }
        const pullRequests = prsResponse.ok ? await prsResponse.json() : [];
        
        setRepoData({
          repoInfo,
          contributors,
          commits,
          issues,
          pullRequests
        });
      } catch (err) {
        console.error("Error in analysis:", err);
        setError(err.message || 'Failed to analyze repository');
      } finally {
        setLoading(false);
      }
    };

    analyzeRepository();
  }, [username, repo]);

  if (loading) {
    return (
      <div className="App-header">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>&gt;</span> 
          <Link to={`/repos/${username}`}>{username}'s Repositories</Link> <span>&gt;</span>
          <span>{repo}</span>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="App-header">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>&gt;</span> 
        <Link to={`/repos/${username}`}>{username}'s Repositories</Link> <span>&gt;</span>
        <span>{repo}</span>
      </div>
      
      {repoData && <RepoAnalysis data={repoData} />}
    </div>
  );
}

export default AnalysisPage;
