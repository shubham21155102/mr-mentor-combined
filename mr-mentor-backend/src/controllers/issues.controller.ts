import { Request, Response } from 'express';
import { IssuesService, CreateIssueDto, UpdateIssueDto } from '../services/IssuesService';
import { DataSource } from 'typeorm';

export class IssuesController {
  private issuesService: IssuesService;

  constructor(dataSource: DataSource) {
    this.issuesService = new IssuesService(dataSource);
  }

  public createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueData: CreateIssueDto = req.body;

      if (!issueData.name || !issueData.email || !issueData.issueType || !issueData.description) {
        res.status(400).json({ success: false, message: 'name, email, issueType and description are required' });
        return;
      }

      const issue = await this.issuesService.createIssue(issueData);
      res.status(201).json({ success: true, message: 'Issue created successfully', data: issue });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create issue', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const issues = await this.issuesService.getAllIssues();
      res.status(200).json({ success: true, message: 'Issues retrieved successfully', data: issues, count: issues.length });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to retrieve issues', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const issue = await this.issuesService.getIssueById(id);

      if (!issue) {
        res.status(404).json({ success: false, message: 'Issue not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Issue retrieved successfully', data: issue });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to retrieve issue', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const issueData: UpdateIssueDto = req.body;

      const issue = await this.issuesService.updateIssue(id, issueData);

      if (!issue) {
        res.status(404).json({ success: false, message: 'Issue not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Issue updated successfully', data: issue });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update issue', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.issuesService.deleteIssue(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Issue not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Issue deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete issue', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
