Build the backend support for operational cost categories in TradeNest, following the existing backend code design exactly.

Use the backend’s current architecture and conventions:
- same folder structure
- same route/controller/service/model patterns
- same auth middleware
- same validation/error response format
- same soft-delete or inactive convention already used elsewhere
- same permission naming style

Frontend context
- Frontend now expects:
  - `src/components/reports/OperationalCosts.tsx`
  - `src/components/settings/OperationalCostCategories.tsx`
  - `src/components/settings/CategorySettings.tsx`
  - `src/lib/api/reportApi.ts`
- Operational cost creation now uses a dropdown category list from API, not free text.

Requirements

1. Create operational cost category model
Fields:
- name
- description
- isActive
- createdAt
- updatedAt

Rules:
- `name` is required
- `name` should be unique
- soft delete / inactive behavior should match existing project conventions

2. Create CRUD endpoints
Implement:
- `GET /reports/operational-cost-categories`
- `GET /reports/operational-cost-categories/:id`
- `POST /reports/operational-cost-categories`
- `PUT /reports/operational-cost-categories/:id`
- `DELETE /reports/operational-cost-categories/:id`

Behavior:
- `GET` list returns active categories by default
- if the backend already supports admin filtering of inactive records, keep it consistent
- delete should either soft-delete or set `isActive = false` if that is the project standard

3. Validate operational cost records against categories
Existing operational cost endpoints:
- `GET /reports/operational-costs`
- `POST /reports/operational-costs`
- `PUT /reports/operational-costs/:id`
- `DELETE /reports/operational-costs/:id`

Update them so:
- `category` must match an existing operational cost category
- inactive categories cannot be used for new operational cost records
- existing records with old category values are handled safely and consistently

4. Permissions
Add or reuse permissions consistent with current naming style, for example:
- `operational_cost_categories.read`
- `operational_cost_categories.create`
- `operational_cost_categories.update`
- `operational_cost_categories.delete`
- `operational_costs.read`
- `operational_costs.create`
- `operational_costs.update`
- `operational_costs.delete`

Update any permission model/seeders required.

5. Response shape
Return data in the project’s standard format, for example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "Rent",
      "description": "Recurring rent expense",
      "isActive": true,
      "createdAt": "2026-03-08T10:00:00.000Z",
      "updatedAt": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

6. Deliverables
Return:
- model(s)
- controller(s)
- service/helper changes
- routes
- permission seed changes
- concise file summary
- assumptions made

Important
- Do not invent a new architecture
- Reuse the reports module patterns already added
- Keep the changes minimal and consistent
