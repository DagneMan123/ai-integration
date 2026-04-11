# User Management Page - Quick Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  User Management                                             │
│  Manage X registered users on the platform                  │
│                                                              │
│  [Search by name/email...] [Role Filter ▼]                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Users  │   Admins     │  Employers   │  Candidates  │
│      X       │      Y       │      Z       │      W       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ User Table                                                   │
├─────────────────────────────────────────────────────────────┤
│ User | Role | Status | Joined | Actions                    │
├─────────────────────────────────────────────────────────────┤
│ [User rows with color-coded roles]                         │
└─────────────────────────────────────────────────────────────┘
```

## Role Filter Options

### All Roles
Shows all users regardless of role

### 👤 Admins
Shows only administrator users
- Purple badge
- Shield icon
- Full platform access

### 🏢 Employers
Shows only employer users
- Blue badge
- Building icon
- Can post jobs and hire

### 👨‍💼 Candidates
Shows only candidate users
- Gray badge
- Person icon
- Can apply for jobs

## Search Functionality

### Search by Name
- Type first name: "John" → finds all Johns
- Type last name: "Smith" → finds all Smiths
- Type full name: "John Smith" → finds exact match

### Search by Email
- Type email: "john@example.com" → finds user
- Type partial: "john@" → finds all with that prefix

### Combined Search + Filter
1. Select role from dropdown
2. Type search term
3. Results show only matching users in selected role

## User Status

### Active (Green)
- User can access platform
- Account is enabled
- Can perform all actions

### Inactive (Red)
- User is blocked/banned
- Cannot access platform
- Account is disabled

## Actions

### Block User (Red X icon)
- Appears on hover
- Blocks active user
- User becomes inactive

### Activate User (Green Check icon)
- Appears on hover
- Activates inactive user
- User becomes active

### More Options (⋮ icon)
- Additional actions menu
- Edit user details
- View user activity
- Delete user (if needed)

## Statistics Cards

### Total Users
- Count of all users in system
- Updates based on current filter

### Admins
- Count of admin users
- Purple color indicator

### Employers
- Count of employer users
- Blue color indicator

### Candidates
- Count of candidate users
- Gray color indicator

## Tips & Tricks

1. **Quick Filter**: Click role dropdown to instantly filter
2. **Precise Search**: Combine role filter + search for best results
3. **Bulk Actions**: Select multiple users for batch operations
4. **Sort**: Click column headers to sort (if enabled)
5. **Export**: Export user list to CSV (if available)

## Keyboard Shortcuts

- `Tab` - Navigate between fields
- `Enter` - Apply filter
- `Esc` - Clear search
- `↑/↓` - Navigate dropdown options

## Common Tasks

### Find All Admins
1. Click role dropdown
2. Select "👤 Admins"
3. View admin users only

### Find Specific User
1. Type user's name or email in search
2. Results filter in real-time
3. Click user row for details

### Block a User
1. Find user in table
2. Hover over row
3. Click red X icon
4. Confirm action

### Filter by Role and Search
1. Select role from dropdown
2. Type search term
3. See filtered results

## Performance Tips

- Search is instant (no server calls)
- Filter updates in real-time
- Works smoothly with 1000+ users
- No page reload needed

## Troubleshooting

### No users showing?
- Check role filter (might be set to specific role)
- Clear search box
- Refresh page

### Can't find user?
- Try different search terms
- Check spelling
- Try email instead of name
- Reset role filter to "All Roles"

### Filter not working?
- Refresh page
- Clear browser cache
- Try different role
- Check internet connection

---

**Last Updated**: 2024
**Version**: 1.0.0
