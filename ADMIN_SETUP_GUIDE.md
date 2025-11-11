# 🚀 Betfuz Admin Setup Guide - Step by Step

**Welcome! Let's get your admin access set up in 3 simple steps.**

---

## ✅ Step 1: Find Your User ID

You need to get your user UUID from the database.

### How to Get Your User ID:

1. **Open Lovable Cloud Backend**
   - Look for the "Cloud" or "Backend" button in Lovable
   - Or click the database icon in the top navigation

2. **Go to Database → Tables → auth.users**
   - Find the `auth.users` table
   - Look for your email address
   - Copy the `id` (UUID) next to your email

**Example UUID:** `550e8400-e29b-41d4-a716-446655440000`

---

## ✅ Step 2: Grant Yourself Admin Access

Now run this SQL to give yourself admin privileges.

### For SUPERADMIN Access (Full Admin Powers):

```sql
-- Replace YOUR_USER_UUID_HERE with the UUID you copied
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  'YOUR_USER_UUID_HERE',
  'superadmin',
  'YOUR_USER_UUID_HERE'
);
```

### For ADMIN Access (Read-Only):

```sql
-- Replace YOUR_USER_UUID_HERE with the UUID you copied
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  'YOUR_USER_UUID_HERE',
  'admin',
  'YOUR_USER_UUID_HERE'
);
```

### Where to Run This SQL:

1. In Lovable Cloud → Database → SQL Editor
2. Paste the SQL above (with your UUID)
3. Click "Run" or "Execute"
4. You should see: "Success: 1 row inserted"

---

## ✅ Step 3: Access Admin Pages

Now you can access the admin area!

### Admin Pages Available:

1. **Admin Dashboard** - Real-time monitoring
   - URL: `/admin/dashboard`
   - Navigate: Click "Admin Dashboard" in left sidebar
   - Features: Audit logs, security alerts, statistics

2. **Webhook Settings** - Configure n8n webhooks (Superadmin only)
   - URL: `/admin/webhooks`
   - Navigate: Click "Webhook Settings" in left sidebar
   - Features: Secure webhook configuration, testing

### In the Sidebar:

Look for the "Admin Area" section with red badges:
- 🛡️ **Admin Dashboard** (ADMIN badge)
- 🔒 **Webhook Settings** (SUPER badge)

---

## 🔐 Role Permissions

### User (Default)
- ❌ No admin access
- ✅ Can use betting platform normally

### Admin
- ✅ View admin dashboard
- ✅ Read audit logs
- ✅ View webhook settings
- ❌ Cannot modify webhook settings
- ❌ Cannot grant/revoke admin roles

### Superadmin
- ✅ All admin permissions
- ✅ Modify webhook settings
- ✅ Grant/revoke admin roles to other users
- ✅ Full system access

---

## 🎯 Quick Reference Commands

### Check Your Current Role:
```sql
SELECT role FROM user_roles WHERE user_id = 'YOUR_UUID_HERE';
```

### Grant Admin Role to Another User:
```sql
-- Only superadmins can do this
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  'TARGET_USER_UUID',
  'admin',  -- or 'superadmin'
  'YOUR_SUPERADMIN_UUID'
);
```

### Revoke Admin Role:
```sql
-- Only superadmins can do this
DELETE FROM user_roles
WHERE user_id = 'TARGET_USER_UUID'
  AND role = 'admin';  -- or 'superadmin'
```

### View All Admin Users:
```sql
SELECT 
  ur.role,
  p.email,
  p.full_name,
  ur.granted_at
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE ur.role IN ('admin', 'superadmin')
ORDER BY ur.granted_at DESC;
```

---

## 🧪 Test Your Admin Access

### 1. Visit Admin Dashboard
Navigate to `/admin/dashboard` - you should see:
- ✅ Dashboard loads without error
- ✅ Audit logs displayed
- ✅ Statistics cards visible
- ✅ No "Access Denied" message

### 2. Check Audit Logs
Your admin actions will be logged:
- Every page visit
- Every webhook change
- Every failed access attempt

### 3. Test Webhook Settings (Superadmin Only)
Navigate to `/admin/webhooks` - you should see:
- ✅ Webhook configuration form
- ✅ Test buttons for each webhook
- ✅ Save button enabled

---

## ⚠️ Security Reminders

### Current Security Status:
- ✅ **Database Level:** Roles in separate table with RLS
- ✅ **API Level:** Server-side role validation
- ✅ **Frontend Level:** Admin guards on all pages
- ⚠️ **Production:** NOT ready (see SECURITY_CHECKLIST.md)

### For Production Deployment:
1. Deploy admin to separate subdomain (admin.betfuz.com)
2. Enable Cloudflare Access with SSO + MFA
3. Configure IP allowlisting
4. Set up monitoring and alerts
5. Use Vault/Secrets Manager for secrets

**See:** `ADMIN_DEPLOYMENT_GUIDE.md` for full production setup

---

## 🐛 Troubleshooting

### "Access Denied" Error
**Problem:** Seeing "Admin access required" message

**Solutions:**
1. Verify role was inserted: `SELECT * FROM user_roles WHERE user_id = 'YOUR_UUID'`
2. Check for typos in UUID
3. Make sure you're logged in as the correct user
4. Try logging out and back in
5. Clear browser cache and refresh

### Can't Find Admin in Sidebar
**Problem:** Don't see "Admin Area" section

**Solutions:**
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check if sidebar is collapsed - expand it
3. Scroll down in sidebar - Admin Area is near bottom

### "Forbidden" Error in Admin Pages
**Problem:** Page loads but API calls fail

**Solutions:**
1. Check JWT token is valid: Log out and back in
2. Verify role in database: `SELECT * FROM user_roles WHERE user_id = 'YOUR_UUID'`
3. Check browser console for specific error
4. Verify edge functions are deployed (automatic)

### Webhook Settings Shows "Forbidden"
**Problem:** Can access dashboard but not webhooks

**Solution:**
- Webhook Settings requires **superadmin** role
- Check your role: `SELECT role FROM user_roles WHERE user_id = 'YOUR_UUID'`
- If you have 'admin', upgrade to 'superadmin':
  ```sql
  UPDATE user_roles 
  SET role = 'superadmin' 
  WHERE user_id = 'YOUR_UUID';
  ```

---

## 📞 Need Help?

### Documentation:
- `ADMIN_ARCHITECTURE.md` - Technical architecture details
- `ADMIN_DEPLOYMENT_GUIDE.md` - Production deployment
- `SECURITY_CHECKLIST.md` - Security verification

### Common Questions:

**Q: Can I have multiple superadmins?**
A: Yes! Just insert additional rows in user_roles for each admin user.

**Q: How do I revoke my own admin access?**
A: You can't revoke your own access. Another superadmin must do it.

**Q: Are admin actions logged?**
A: Yes! Every admin action is logged to the `admin_audit_log` table with IP, timestamp, and details.

**Q: Can I delete audit logs?**
A: No! Audit logs are immutable by design. They have no UPDATE or DELETE policies.

**Q: What if I forget my admin password?**
A: Use Supabase password reset. Admin roles are tied to user accounts, not passwords.

---

## ✅ Setup Complete Checklist

- [ ] Found my user UUID from database
- [ ] Ran SQL to grant admin/superadmin role
- [ ] Verified role in user_roles table
- [ ] Logged out and back in
- [ ] Accessed /admin/dashboard successfully
- [ ] Saw admin navigation in sidebar
- [ ] Tested viewing audit logs
- [ ] (Superadmin only) Accessed webhook settings

**Congratulations! Your admin access is set up.** 🎉

---

## 🚀 Next Steps

1. **Explore Admin Dashboard**
   - Review audit logs
   - Check security statistics
   - Familiarize yourself with monitoring

2. **Configure Webhooks** (Superadmin)
   - Set up n8n webhook URLs
   - Test webhook connections
   - Review example payloads

3. **Grant Admin to Team** (Superadmin)
   - Add other team members as admins
   - Choose appropriate role levels
   - Document who has access

4. **Review Security Checklist**
   - Read `SECURITY_CHECKLIST.md`
   - Understand production requirements
   - Plan infrastructure upgrades

5. **Plan Production Deployment**
   - Follow `ADMIN_DEPLOYMENT_GUIDE.md`
   - Set up separate admin subdomain
   - Configure SSO + MFA
   - Enable monitoring
