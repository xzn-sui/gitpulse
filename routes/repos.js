const express = require('express');
const router = express.Router();
const https = require('https');

const TIMEFRAMES = {
  week:     7,
  month:    30,
  '3months': 90,
  '6months': 180,
  year:     365
};

// Stars threshold scales down for shorter windows so recent repos aren't excluded
const STARS_BY_TIMEFRAME = {
  all:      'stars:>5000',
  year:     'stars:>200',
  '6months':'stars:>100',
  '3months':'stars:>30',
  month:    'stars:>5',
  week:     'stars:>=1'
};

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function fetchFromGitHub(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'GitPulse-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /repos
router.get('/', async (req, res) => {
  const language  = req.query.language  || 'All';
  const topic     = req.query.topic     || 'All';
  const timeframe = req.query.timeframe || 'all';

  const parts = [];

  // Stars / date range
  parts.push(STARS_BY_TIMEFRAME[timeframe] || STARS_BY_TIMEFRAME.all);
  if (timeframe !== 'all' && TIMEFRAMES[timeframe]) {
    parts.push(`created:>${dateOffset(TIMEFRAMES[timeframe])}`);
  }

  if (language !== 'All') parts.push(`language:${language}`);
  if (topic    !== 'All') parts.push(`topic:${topic}`);

  const q = parts.join('+');
  const apiUrl = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=24`;

  try {
    const data = await fetchFromGitHub(apiUrl);
    const repos = (data.items || []).map(r => ({
      id:          r.id,
      repoName:    r.name,
      repoUrl:     r.html_url,
      author:      r.owner.login,
      description: r.description || '',
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      language:    r.language || 'N/A'
    }));
    res.render('repos', { title: 'Explore Repos', repos, language, topic, timeframe });
  } catch (err) {
    console.error('GitHub API error:', err);
    res.render('repos', {
      title: 'Explore Repos', repos: [], language, topic, timeframe,
      error: 'Failed to fetch repositories. GitHub API may be rate-limiting — try again in a moment.'
    });
  }
});

module.exports = router;
