# UniAct Workflow Setup Guide

## Prerequisites

**Important:** Open VS Code in administrator mode before starting.

---

## Step 1: Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:<your_password>@localhost:5432/UniAct?schema=public"
DATABASE_SCHEMA_URL="postgresql://postgres:<your_password>@localhost:5432/UniAct"
JWT_KEY=edfcb477f2e26a727701dbbff03e0408
TOKEN_LIFETIME=24h
APPLICATION_EMAIL=uniact.notification@gmail.com
APPLICATION_PASSWORD=kypscqxlwzdmlekd
NODE_ENV=Development
PRISMA_SKIP_ENGINE_CHECK=false
PRISMA_CLI_QUERY_ENGINE_TYPE=binary
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=true
```

**Replace** `<your_password>` with your actual PostgreSQL password.

**Note:** The project includes a default tenant (anu) with pre-generated files in the repository to simplify setup.

---

## Step 2: Install Dependencies

Run the following command:

```bash
npm install
```

---

## Step 3: Initialize Database Schemas

We need to public schema:

### Create Public Schema

```bash
cd .\prisma\Public\
npx prisma migrate dev --name init --schema=./schema.prisma
```

After completion, verify in PgAdmin 4 that the database and public schema have been created.

---

## Step 4: Create the First SuperAdmin

The first SuperAdmin must be created manually in the database.

### Insert SuperAdmin Record

Open your database client (PgAdmin 4) and execute:

```sql
INSERT INTO "SuperAdmin" (username, email, password, is_active) 
VALUES ('your_username', 'real-email@gmail.com', '$2a$10$ykgK7NYvZpVR2UjHXXAZaOKVXEsLaqv.TedG..wr2Z24QqI5Yn4Ii', true);
```

**Important:** 
- Replace `your_username` with your desired username
- Replace `real-email@gmail.com` with a real email address
- Keep the password hash as-is (it equals `aaAA11!!`)

### Test SuperAdmin Login

1. Install ts-node if needed: `npm install -g ts-node`
2. Start the project
3. Navigate to the API documentation: `http://localhost:3000/api-docs/`
4. Find **Super Admin** category → `/api/superadmin/login`
5. Click **Try it out** and use:

```json
{
  "email": "real-email@gmail.com",
  "password": "aaAA11!!"
}
```

6. **Copy the token** from the response (you'll need it for the next steps)

---

## Step 5: Create the First Tenant

### Authorize Yourself

1. Click the **Authorize** button at the top of the API documentation
2. Paste your token from Step 4

### Create Tenant

1. Go to **Tenant** category → `POST /tenant/create`
2. Click **Try it out**
3. Submit:

```json
{
  "name": "Alexandria National University",
  "subdomain": "anu",
  "db_schema": "alexandria_national_university"
}
```

**Expected Response:**

```json
{
  "status": "success",
  "message": "Tenant created successfully!",
  "data": {
    "id": 1,
    "name": "Alexandria National University",
    "subdomain": "anu",
    "db_schema": "alexandria_national_university",
    "created_at": "2025-11-17T12:18:26.388Z",
    "updated_at": "2025-11-17T12:18:26.388Z",
    "is_active": false,
    "university_id": null
  }
}
```

### Verify Hosts File

Check if the following line exists in `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1   www.anu.local
```

**If missing:** You'll see an error in the console. Close VS Code and reopen it in administrator mode, then try again.

---

## Step 6: Create the University

Go to **University** category → `POST /university/create`

```json
{
  "name": "Alexandria National University",
  "address": "Alexandria, Egypt",
  "phone": "+20 120 456 7890",
  "email": "info@anu.edu.eg",
  "website": "https://www.anu.edu.eg",
  "established_date": "2022-10-01",
  "accreditation": "National Accreditation by the Egyptian Ministry of Higher Education"
}
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Alexandria National University",
    ...
  },
  "message": "University created successfully!"
}
```

---

## Step 7: Link University to Tenant

Go to **University** category → `PUT /university/assign`

```json
{
  "tenant_id": 1,
  "university_id": 1
}
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "id": 5,
    "name": "Alexandria National University",
    "subdomain": "anu",
    "is_active": true,
    "university_id": 1,
    ...
  },
  "message": "Tenant assigned to university successfully."
}
```

After this step:
- A new **Tenant** folder is created inside the `prisma` folder
- A new database URL is added to your `.env` file

---

## Step 8: Initialize Tenant Database

Create the database schema for the university:

- shutdown the server

```bash
cd .\prisma\Tenant\alexandria_national_university\
npx prisma migrate dev --name init --schema=./schema.prisma
```

---

## Step 9: Create Root Admin Account

Go to **Super Admin** category → `POST /superadmin/assign-root-account`

```json
{
  "university_name": "Alexandria National University",
  "username": "root_admin",
  "first_name": "Mark",
  "last_name": "Magdy",
  "email": "your_email@gmail.com", <--- write correct email
  "password": "aaAA11!!",
  "phone": "+201234567890",
  "date_of_birth": "1985-03-15",
  "address": "123 University Street, Smouha",
  "city": "Alexandria",
  "country": "Egypt",
  "national_id": "28503151234567"
}
```

**Important:**
- You'll receive a confirmation email
- **Confirm from your PC** (mobile confirmation has issues currently)
- This root account automatically gets all predefined permissions

### Understanding Root Permissions

The root account has default permissions defined in `/Repositories/TransactionRepository` (line 58).

**To add new permissions** (e.g., for Courses):

1. **Define permissions** in `/Repositories/RBACRepository`:

```typescript
public static Course = class {
  static Read    = { name: "course.read",    description: "Read courses" };
  static Create  = { name: "course.create",  description: "Create courses" };
  static Update  = { name: "course.update",  description: "Update courses" };
  static Delete  = { name: "course.delete",  description: "Delete courses" };
};
```

2. **Add to default permissions** in `/Repositories/TransactionRepository` (line 58):

```typescript
const default_permissions = [
  RBACRepository.RBAC.Create,
  RBACRepository.RBAC.Read,
  RBACRepository.RBAC.Update,
  RBACRepository.RBAC.Delete,
  RBACRepository.Account.Create,
  RBACRepository.Account.Read,
  RBACRepository.Account.Update,
  RBACRepository.Account.Delete,
  RBACRepository.Account.AssignRole,
  // New permissions
  RBACRepository.Course.Read,
  RBACRepository.Course.Create,
  RBACRepository.Course.Update,
  RBACRepository.Course.Delete,
];
```

---

## Step 10: Login as Root Admin

Go to **User Authentication** category → `POST /user/login`

**Set Host header:** `www.anu.local`

```json
{
  "email": "your_email@gmail.com",
  "password": "aaAA11!!"
}
```

**Note:** If you get "access denied," try using Postman instead.

---

## Step 11: Create Additional Users

The root account can create other accounts and assign roles.

### 11.1: Create a Role

Go to **Roles** category → `POST /rbac/create`

**Set Host header:** `www.anu.local`

```json
{
  "name": "Data Entry",
  "description": "Responsible for entering and maintaining system data"
}
```

### 11.2: Assign Permissions to Role

After creating the role, assign permissions to it.

**Set Host header:** `www.anu.local`

Enter the role ID and submit:

```json
{
  "permissions": [
    "rbac.read",
    "rbac.create"
  ]
}
```

**Note:** Permissions must be predefined in the system.

### 11.3: Create Staff Account (with CV Upload)

This requires file upload, so we'll use the **REST Client** extension for VS Code.

1. Install the **REST Client** extension in VS Code
2. there is a file named `requests.http` in your project
3. Add the following content:
4. Click **Send Request** above the POST line

**Result:**
- An `upload` folder will be created with the CV
- You'll receive a confirmation email (confirm from PC)

### 11.4: Assign Role to Staff Account

Go to **User Role** category → `POST /rbac/assign-role-to-user/{id}`

**Set Host header:** `www.anu.local`

Enter the user ID and submit:

```json
{
  "role_names": [
    "Data Entry"
  ]
}
```

---

## Step 12: Login as Staff User

Go to **User Authentication** category → `POST /user/login`

**Set Host header:** `www.anu.local`

```json
{
  "email": "your_email@example.com",
  "password": "aaAA11!!"
}
```

**Verify Token:**
1. Copy the token from the response
2. Visit `https://jwt.io/`
3. Paste the token to view its contents

---

## Step 13: Testing Permission System

Let's verify that the permission system works correctly.

### Test Access Control

Try to access an RBAC endpoint using the staff account `your_email@example.com`.

**Example:** Try to delete a role or access an endpoint that requires `rbac.delete` permission.

**Result:** You will receive an **access denied** error because this account only has `rbac.read` and `rbac.create` permissions, not `rbac.delete`.

This demonstrates that the role-based access control (RBAC) system is working properly and restricting users to only their assigned permissions.

---

## Summary

You've successfully:
- ✅ Set up the database with public and tenant schemas
- ✅ Created a SuperAdmin account
- ✅ Created a tenant (university)
- ✅ Created a root admin with full permissions
- ✅ Created roles with specific permissions
- ✅ Created staff accounts and assigned roles
- ✅ Tested the permission system

Your multi-tenant university management system is now ready to use!