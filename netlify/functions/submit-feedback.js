exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const feedback = JSON.parse(event.body);
    
    // For development, just log the feedback
    // In production, you'd create a GitHub issue or send to your preferred service
    console.log('Feedback received:', feedback);
    
    // Option 1: Create GitHub Issue (requires GitHub token in environment variables)
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      const [owner, repo] = process.env.GITHUB_REPO.split('/');
      
      const issueBody = `
## Feedback from Website

**URL:** ${feedback.url}
**Element:** ${feedback.selector}
**Position:** x: ${feedback.position.x}, y: ${feedback.position.y}
**Viewport:** ${feedback.viewport.width}x${feedback.viewport.height}
**Timestamp:** ${feedback.timestamp}

### User Feedback:
${feedback.text}

### Browser Info:
${feedback.userAgent}
      `;
      
      await octokit.issues.create({
        owner,
        repo,
        title: `Website Feedback: ${feedback.text.substring(0, 50)}...`,
        body: issueBody,
        labels: ['feedback', 'website']
      });
    }
    
    // Option 2: Store in Supabase (since you already have it in the project)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      
      await supabase.from('feedback').insert([feedback]);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Feedback received successfully' })
    };
  } catch (error) {
    console.error('Error processing feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process feedback' })
    };
  }
};