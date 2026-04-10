# NearFix Postman MCP Testing Pack

## Files

- `NearFix.postman_collection.json`: Full API collection with folders and tests.
- `NearFix.postman_environment.json`: Environment template with required variables.

## Setup

1. Import both files into Postman.
2. Fill environment values:
   - `baseUrl` = your Supabase URL (e.g. https://xxxx.supabase.co)
   - `anonKey` = Supabase anon key
   - account credentials for customer/worker/admin
3. Select environment `NearFix Local`.

## Run Order (Collection Runner)

1. `Auth / Customer Login`
2. `Auth / Worker Login`
3. `Auth / Admin Login`
4. `Workers / List Workers`
5. `Workers / Worker Detail`
6. `Slots / List Worker Slots`
7. `Bookings / Create Booking`
8. `Bookings / Worker Accept Booking`
9. `Bookings / Worker Complete Booking`
10. `Reviews / Create Review`
11. `Admin / Verify Worker`
12. `Negative / Invalid Token`
13. `Negative / Customer Admin Action Blocked`
14. `Negative / Worker Modify Other Worker Slot`
15. `Negative / Review Before Completion Blocked`

## Regression Export

1. Open Collection Runner and run full collection.
2. Export run report JSON from runner results as `nearfix-web/docs/postman/reports/latest-run.json`.

## MCP Notes

- Required MCP sequence was followed in this repo work:
  - `getCodeGenerationInstructions` first
  - `getAuthenticatedUser` for context
- Postman Cloud API create/list operations are currently blocked by Invalid API Key in this environment.
- Collection/environment files are ready and importable immediately.
