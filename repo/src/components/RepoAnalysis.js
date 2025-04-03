import React, { useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

function RepoAnalysis({ data }) {
  const { repoInfo, contributors, commits, issues, pullRequests } = data;
  const pdfContentRef = useRef(null);

  // Process most active contributors
  const topContributors = contributors
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 5)
    .map(contributor => ({
      name: contributor.login,
      contributions: contributor.contributions,
      avatar: contributor.avatar_url
    }));

  // Calculate commit frequency by grouping commits
  const commitsByDate = {};
  commits.forEach(commit => {
    const date = new Date(commit.commit.author.date).toLocaleDateString();
    commitsByDate[date] = (commitsByDate[date] || 0) + 1;
  });
  
  const commitFrequencyData = Object.keys(commitsByDate).map(date => ({
    date,
    commits: commitsByDate[date]
  })).slice(-14); // Last 14 days
  
  // Process issue statistics
  const openIssues = issues.filter(issue => !issue.pull_request && issue.state === 'open').length;
  const closedIssues = issues.filter(issue => !issue.pull_request && issue.state === 'closed').length;
  
  const issueData = [
    { name: 'Open', value: openIssues },
    { name: 'Closed', value: closedIssues }
  ];
  
  // Process pull request statistics
  const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
  const closedPRs = pullRequests.filter(pr => pr.state === 'closed').length;
  const mergedPRs = pullRequests.filter(pr => pr.merged_at).length;
  
  const prData = [
    { name: 'Open', value: openPRs },
    { name: 'Closed', value: closedPRs },
    { name: 'Merged', value: mergedPRs }
  ];

  // Calculate average time to close issues (for closed issues with created_at and closed_at)
  const closedIssuesWithDates = issues.filter(issue => 
    !issue.pull_request && 
    issue.state === 'closed' &&
    issue.created_at && 
    issue.closed_at
  );
  
  let avgIssueResolutionTime = 0;
  if (closedIssuesWithDates.length > 0) {
    const totalResolutionTime = closedIssuesWithDates.reduce((sum, issue) => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return sum + (closed - created) / (1000 * 60 * 60 * 24); // days
    }, 0);
    avgIssueResolutionTime = Math.round(totalResolutionTime / closedIssuesWithDates.length);
  }

  // Colors for charts - updated to match the new color scheme
  const COLORS = ['#3D5A80', '#98C1D9', '#EE6C4D', '#293241'];

  // Function to handle PDF download
  const handleDownloadPDF = () => {
    const element = pdfContentRef.current;
    const filename = `${repoInfo.name}-analysis.pdf`;

    // Configure options for pdf generation
    const options = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Show loading message
    alert("Generating PDF... This may take a moment.");

    // Generate PDF - need to use window.html2pdf since we're loading from CDN
    window.html2pdf().from(element).set(options).save().then(() => {
      console.log("PDF generated successfully");
    }).catch(error => {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    });
  };

  return (
    <div className="analysis-container">
      <div className="download-section">
        <button 
          className="download-pdf-btn no-print" 
          onClick={handleDownloadPDF}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          Download Analysis as PDF
        </button>
      </div>
      
      <div id="pdf-content" ref={pdfContentRef}>
        <h2>{repoInfo.name} Repository Analysis</h2>
        <p>{repoInfo.description}</p>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Repository Stats</h3>
            <p>⭐ Stars: {repoInfo.stargazers_count}</p>
            <p>👁️ Watchers: {repoInfo.subscribers_count}</p>
            <p>🍴 Forks: {repoInfo.forks_count}</p>
            <p>📅 Created: {new Date(repoInfo.created_at).toLocaleDateString()}</p>
            <p>📝 Last Updated: {new Date(repoInfo.updated_at).toLocaleDateString()}</p>
          </div>
          
          <div className="metric-card">
            <h3>Issue Statistics</h3>
            <p>🐛 Open Issues: {openIssues}</p>
            <p>✅ Closed Issues: {closedIssues}</p>
            <p>⏱️ Avg. Resolution Time: {avgIssueResolutionTime} days</p>
          </div>
          
          <div className="metric-card">
            <h3>Pull Request Statistics</h3>
            <p>🔄 Open PRs: {openPRs}</p>
            <p>❌ Closed PRs: {closedPRs}</p>
            <p>✅ Merged PRs: {mergedPRs}</p>
          </div>
        </div>

        <h3>Top Contributors</h3>
        <ul className="contributor-list">
          {topContributors.map((contributor) => (
            <li key={contributor.name} className="contributor-item">
              <img src={contributor.avatar} alt={contributor.name} className="contributor-avatar" />
              <span>{contributor.name} - {contributor.contributions} contributions</span>
            </li>
          ))}
        </ul>
        
        <div className="chart-container">
          <h3>Commit Frequency (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={commitFrequencyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 251, 252, 0.2)" />
              <Tooltip contentStyle={{ backgroundColor: '#293241', color: '#E0FBFC', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="commits" stroke="#EE6C4D" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top Contributors</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topContributors}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#293241', color: '#E0FBFC', border: 'none' }} />
              <Legend />
              <Bar dataKey="contributions" fill="#3D5A80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Issues Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={issueData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {issueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#293241', color: '#E0FBFC', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>PR Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={prData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#293241', color: '#E0FBFC', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="summary-section">
          <h3>Repository Summary</h3>
          <p><strong>Name:</strong> {repoInfo.name}</p>
          <p><strong>Owner:</strong> {repoInfo.owner.login}</p>
          <p><strong>Created on:</strong> {new Date(repoInfo.created_at).toLocaleDateString()}</p>
          <p><strong>Last updated:</strong> {new Date(repoInfo.updated_at).toLocaleDateString()}</p>
          <p><strong>Stars:</strong> {repoInfo.stargazers_count}</p>
          <p><strong>Forks:</strong> {repoInfo.forks_count}</p>
          <p><strong>Open Issues:</strong> {repoInfo.open_issues_count}</p>
          <p><strong>Default Branch:</strong> {repoInfo.default_branch}</p>
          <p><strong>License:</strong> {repoInfo.license ? repoInfo.license.name : 'Not specified'}</p>
          <p><strong>Language:</strong> {repoInfo.language || 'Not specified'}</p>
        </div>
        
        <div className="footer-info">
          <p>Generated using GitHub Repository Analyzer on {new Date().toLocaleDateString()}</p>
          <p>Repository URL: <a href={repoInfo.html_url}>{repoInfo.html_url}</a></p>
        </div>
      </div>
    </div>
  );
}

export default RepoAnalysis;
