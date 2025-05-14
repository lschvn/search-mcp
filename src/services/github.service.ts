import { Octokit } from '@octokit/rest';   
import type { CodeHit } from '../types/index.js';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

export async function githubCodeSearch(q: string, perPage = 20): Promise<CodeHit[]> {
  const { data } = await octokit.search.code({ q, per_page: perPage });
  return data.items.map((i) => ({
    name: i.name,
    repo: i.repository.full_name,
    path: i.path,
    url: i.html_url,
  }));
}
