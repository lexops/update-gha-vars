const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');

async function run() {
  try {
    const rawYaml = core.getInput('config-yaml');
    const config = yaml.load(rawYaml);
    const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error('Missing required input "github-token"');
    }

    const octokit = github.getOctokit(githubToken);

    for (const [key, value] of Object.entries(config)) {
      const existingVar = await octokit.rest.actions.getRepoVariable({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: key,
      });

      if (existingVar.status === 200) {
        await octokit.rest.actions.updateRepoVariable({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          name: key,
          value: value,
        });
      } else {
        await octokit.rest.actions.createRepoVariable({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          name: key,
          value: value,
        });
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
