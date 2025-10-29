import { DataSource, Repository } from 'typeorm';
import { Issues } from '../entities/Issues';

export interface CreateIssueDto {
  name: string;
  email: string;
  issueType: string;
  imageUrl?: string;
  description: string;
}

export interface UpdateIssueDto {
  name?: string;
  email?: string;
  issueType?: string;
  imageUrl?: string;
  description?: string;
}

export class IssuesService {
  private issuesRepository: Repository<Issues>;

  constructor(dataSource: DataSource) {
    this.issuesRepository = dataSource.getRepository(Issues);
  }

  public async createIssue(issueData: CreateIssueDto): Promise<Issues> {
    try {
      const issue = this.issuesRepository.create(issueData as Issues);
      return await this.issuesRepository.save(issue);
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAllIssues(): Promise<Issues[]> {
    try {
      return await this.issuesRepository.find();
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getIssueById(id: string): Promise<Issues | null> {
    try {
      return await this.issuesRepository.findOne({ where: { id: Number(id) } as any });
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async updateIssue(id: string, issueData: UpdateIssueDto): Promise<Issues | null> {
    try {
      const issue = await this.getIssueById(id);
      if (!issue) return null;
      Object.assign(issue, issueData);
      return await this.issuesRepository.save(issue);
    } catch (error) {
      throw new Error(`Failed to update issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async deleteIssue(id: string): Promise<boolean> {
    try {
      const result = await this.issuesRepository.delete(Number(id));
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      throw new Error(`Failed to delete issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
