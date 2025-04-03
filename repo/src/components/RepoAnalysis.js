import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

function RepoAnalysis({ data }) {
  const { repoInfo, contributors, commits, issues, pullRequests } = data;

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

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="analysis-container">
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
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="commits" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Top Contributors</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topContributors}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="contributions" fill="#61dafb" />
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
            <Tooltip />
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
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RepoAnalysis;
