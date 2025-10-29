import { Router } from 'express';
import { IssuesController } from '../controllers/issues.controller';
import { DataSource } from 'typeorm';

export class IssuesRoutes {
  public router: Router;
  private issuesController: IssuesController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.issuesController = new IssuesController(dataSource);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/issues - list issues
    this.router.get('/issues', this.issuesController.getAllIssues);

    // GET /api/issues/:id - get issue
    this.router.get('/issues/:id', this.issuesController.getIssueById);

    // POST /api/issues - create issue
    this.router.post('/issues', this.issuesController.createIssue);

    // PUT /api/issues/:id - update issue
    this.router.put('/issues/:id', this.issuesController.updateIssue);

    // DELETE /api/issues/:id - delete issue
    this.router.delete('/issues/:id', this.issuesController.deleteIssue);
  }
}
