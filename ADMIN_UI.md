# Kora Admin UI

Admin routes added to the existing Kora TanStack Start project:

- `/admin/login` — admin/sub-admin login
- `/admin` — dashboard metrics
- `/admin/orders` — order search, filters, details, status/assignment/cancel actions
- `/admin/riders` — rider list, KYC documents, verify/reject/edit/delete
- `/admin/washers` — washer list, KYC documents, verify/reject/edit/delete
- `/admin/customers` — customer search, details, edit/delete
- `/admin/subadmins` — create/edit/suspend/delete sub-admins and assign live permissions
- `/admin/admins` — list/create unrestricted super admins

## Backend URL

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend URL.

```env
VITE_API_BASE_URL=http://localhost:5000
```

The token is stored as `kora-admin-token` in browser local storage. Every protected API call sends it as `Authorization: Bearer <token>`.

## Permission behavior

- Super admins see every section and destructive delete actions.
- Sub-admin navigation is generated from `/api/admin/me` permissions.
- Manage/edit/verify controls are hidden when the required permission is absent.
- A `403` API response shows a global permission toast.
- A `401` response clears the saved admin session and returns the user to login.

Complaint/config pages are intentionally not added because the supplied API reference marks those permission keys as reserved but does not define complaint/config endpoints yet.
