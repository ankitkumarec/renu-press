# RENU PRESS — Multi-app architecture

Public website and ERP are **not mixed**.

| App | URL | UI | Audience |
|-----|-----|-----|----------|
| **Public website** | `/` | Luxury colourful marketing | Visitors |
| **Customer portal** | `/portal` | Light SaaS blue/white | Customers |
| **Staff portal** | `/staff` | Dark amber floor UI | Production staff |
| **Admin ERP** | `/erp` | Enterprise violet dashboard | Owners / managers |
| **Auth hub** | `/login` | Glass login (no public nav) | All |

## Logins

| Role | Email | Password | Opens |
|------|--------|----------|--------|
| Admin | `admin@renupress.in` | `Renu@Admin2026` | `/erp` |
| Staff (Om) | `staff@renupress.in` | `Staff@123` | `/staff` |
| Customer | `customer@example.com` | `Customer@123` | `/portal` |

## ERP modules (live)

- Dashboard widgets + sparklines  
- Orders + production kanban  
- Inventory cards + low-stock  
- Smart expenses + proof upload + OCR auto-fill  
- CRM / leads / quotes  
- Purchase orders · suppliers  
- HR: attendance, leaves, salary slips  
- Document vault · reports  

## Code map

```
src/app/(site)     Public website
src/app/(auth)     Login only
src/app/portal     Customer portal
src/app/staff      Staff portal
src/app/erp        Admin ERP
src/components/erp | portal | staff
prisma/schema.prisma
```
