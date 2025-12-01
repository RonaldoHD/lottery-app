# PocketBase Backend Setup

## Installation

1. Download PocketBase from https://pocketbase.io/docs/
2. Extract the executable to this `backend` folder
3. Run PocketBase:
   ```bash
   ./pocketbase serve
   ```
4. Access admin panel at http://127.0.0.1:8090/_/

## Initial Setup

1. Open http://127.0.0.1:8090/_/
2. Create your superuser account (email/password) - **this is the account you'll use to log into the admin dashboard**

## Create Collections Manually

Since PocketBase import can be tricky, create these collections manually in the admin UI:

### Collection 1: `draws`

1. Go to **Collections** → **New collection**
2. Name: `draws`
3. Type: **Base collection**
4. Add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| title | Plain text | Required, Max 200 |
| description | Plain text | Max 2000 |
| image_url | URL | - |
| start_date | DateTime | - |
| end_date | DateTime | - |
| status | Select | Options: `draft`, `active`, `completed` (Required) |
| entry_fee | Number | Min: 0 |

5. **API Rules** (click on the gear icon):
   - List/Search: Leave empty (public)
   - View: Leave empty (public)
   - Create: `@request.auth.id != ""`
   - Update: `@request.auth.id != ""`
   - Delete: `@request.auth.id != ""`

---

### Collection 2: `products`

1. Go to **Collections** → **New collection**
2. Name: `products`
3. Type: **Base collection**
4. Add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| draw_id | Relation | → `draws` collection, Required, Single |
| name | Plain text | Required, Max 200 |
| description | Plain text | Max 2000 |
| image_url | URL | - |
| retail_price | Number | Min: 0 |
| specifications | JSON | - |
| features | JSON | - |

5. **API Rules**:
   - List/Search: Leave empty (public)
   - View: Leave empty (public)
   - Create: `@request.auth.id != ""`
   - Update: `@request.auth.id != ""`
   - Delete: `@request.auth.id != ""`

---

### Collection 3: `submissions`

1. Go to **Collections** → **New collection**
2. Name: `submissions`
3. Type: **Base collection**
4. Add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| draw_id | Relation | → `draws` collection, Required, Single |
| user_email | Email | Required |
| user_name | Plain text | Max 100 |
| status | Select | Options: `pending`, `confirmed`, `winner` (Required) |

5. **API Rules**:
   - List/Search: `@request.auth.id != ""`
   - View: `@request.auth.id != ""`
   - Create: Leave empty (public - so users can submit entries)
   - Update: `@request.auth.id != ""`
   - Delete: `@request.auth.id != ""`

---

## Admin Dashboard Login

The admin dashboard at `/admin/login` uses your **PocketBase superuser credentials** (the account you created when first setting up PocketBase).

- Email: Your superuser email
- Password: Your superuser password

This is the same login you use for the PocketBase admin UI at `http://127.0.0.1:8090/_/`

## Troubleshooting

### "Invalid credentials" on admin login
- Make sure you're using the **superuser** account credentials (the first account created in PocketBase)
- The superuser account is different from regular user accounts

### Collections not showing
- Make sure PocketBase is running (`./pocketbase serve`)
- Check the browser console for CORS or connection errors
- Verify the URL is correct: `http://127.0.0.1:8090`

### API errors when creating records
- Make sure all required fields are filled in
- Check that the collections were created with the correct field types
