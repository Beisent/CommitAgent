import simpleGit, { SimpleGit } from 'simple-git';
import { GitDiff } from './types';

export class GitService {
  private git: SimpleGit;

  constructor(baseDir: string = process.cwd()) {
    this.git = simpleGit(baseDir);
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getStagedDiff(): Promise<GitDiff> {
    const diff = await this.git.diff(['--cached']);
    const status = await this.git.status();

    const stagedFiles = [
      ...status.staged,
      ...status.created,
      ...status.modified.filter(f => status.staged.includes(f))
    ];

    return {
      files: stagedFiles,
      additions: 0,
      deletions: 0,
      diff
    };
  }

  async hasChanges(): Promise<boolean> {
    const status = await this.git.status();
    return status.staged.length > 0 || status.created.length > 0;
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }
}
