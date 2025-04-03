import React, { useState } from 'react';

function RepoForm({ onSubmit }) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim() && repoUrl.includes('github.com')) {
      onSubmit(repoUrl);
    }
  };

  return (
    <form className="repo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter GitHub repository URL (e.g., https://github.com/facebook/react)"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        required
      />
      <button type="submit">Analyze Repository</button>
    </form>
  );
}

export default RepoForm;
