# Maintenance System Environment Control

## Monthly Workflow

### Normal Operation (29 days/month)
Add to `.env.local`:
```
DISABLE_MAINTENANCE_CHECKING=true
```
Then restart server: `npm run dev`

### Maintenance Day
Remove or comment out from `.env.local`:
```
# DISABLE_MAINTENANCE_CHECKING=true
```
Then restart server: `npm run dev`

## Owner Dashboard Features
- View environment override status
- Enable/disable maintenance system checking (when environment allows)
- Toggle maintenance mode (when system is enabled)
- Real-time status updates

## System Behavior
- **Environment Disabled**: Zero maintenance overhead, all checks bypassed
- **System Disabled**: Owner can disable checking via dashboard
- **Fully Enabled**: Complete maintenance functionality active