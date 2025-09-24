# Controllers Directory

For this demo application, the business logic is simple enough to be handled directly in the route files. In a larger application, you would typically:

1. Move complex business logic from routes to controllers
2. Create service layers for data access
3. Implement more sophisticated error handling
4. Add input validation at the controller level

Example controller structure:
```typescript
// conflictController.ts
export class ConflictController {
  static async getConflicts(req: Request, res: Response) {
    // Business logic here
  }

  static async getConflictById(req: Request, res: Response) {
    // Business logic here
  }
}
```