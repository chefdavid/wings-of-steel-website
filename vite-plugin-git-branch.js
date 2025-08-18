import { execSync } from 'child_process';

export default function gitBranchPlugin() {
  let branch = 'unknown';
  
  try {
    // Get current git branch
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn('Could not determine git branch');
  }

  return {
    name: 'vite-plugin-git-branch',
    config() {
      return {
        define: {
          'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(branch)
        }
      };
    }
  };
}