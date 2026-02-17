# LARDIA - Estado del Proyecto

> Última actualización: 2026-02-17
> Dominio: lardia.com.br | Vercel: lardia.vercel.app | EC2: 54.207.197.86

---

## Infraestructura

- [x] Supabase proyecto creado (kimxgwxoxgjcdtpvpzxl)
- [x] Vercel deploy (lardia.vercel.app)
- [x] Dominio lardia.com.br comprado en registro.br
- [x] EC2 São Paulo (54.207.197.86) - proxy eSocial
- [x] SSH key: ~/.ssh/lardia-sp.pem
- [x] Nginx reverse proxy en EC2 (puerto 3100)
- [x] Let's Encrypt HTTPS en api.lardia.com.br
- [x] systemd service: esocial-proxy
- [x] Stripe test mode configurado (pk_test, sk_test, webhook)
- [x] Stripe LIVE configurado
- [x] eCNPJ certificado A1 instalado (AC SOLUTI, válido hasta ago 2026)
- [x] Vercel Analytics habilitado
- [x] Sentry error tracking habilitado
- [x] Google Analytics 4 + Meta Pixel (2026-02)
- [x] ImprovMX cuenta creada, wildcard *@lardia.com.br → paumejiagiraldo@gmail.com (2026-02-16)
- [x] Resend: dominio lardia.com.br verificado, DKIM OK (2026-02-16)
- [x] Procuração eCAC confirmada desde Cocora (2026-02-16)
- [x] Resend: dominio completamente verificado (DKIM + SPF) (2026-02-17)
- [x] Supabase SMTP custom con Resend (noreply@lardia.com.br) (2026-02-17)
- [x] eCNPJ copiado al EC2 (~/playwright-rpa/ecnpj.p12) (2026-02-17)
- [ ] VPN residencial brasileña en EC2 (Bright Data) - para login gov.br

---

## DNS (registro.br)

- [x] A record: `@` → 76.76.21.21 (Vercel)
- [x] A record: `api` → 54.207.197.86 (EC2)
- [x] CNAME: `www` → cname.vercel-dns.com
- [x] MX: `@` → mx1.improvmx.com (prioridad 10)
- [x] MX: `@` → mx2.improvmx.com (prioridad 20)
- [x] TXT: `@` → `v=spf1 include:spf.improvmx.com ~all` (SPF ImprovMX)
- [x] TXT: `resend._domainkey` → DKIM Resend (2026-02-16)
- [x] TXT: `_dmarc` → DMARC policy (2026-02-16)
- [x] MX: `send` → feedback-smtp.us-east-1.amazonses.com (Resend) (2026-02-16)
- [x] TXT: `send` → SPF Resend (2026-02-16)

---

## Features

### Sprint 1 - Base
- [x] Next.js + Supabase + shadcn/ui + motor de cálculo de nómina
- [x] Auth (login/signup) + dashboard + esquema DB + middleware
- [x] Toggle visibilidad de contraseña
- [x] Registro de empleados y dashboard
- [x] Calculadora de nómina con cálculos en tiempo real
- [x] Guardar cálculos de nómina en DB

### Sprint 2 - Calculadoras y PDF
- [x] Calculadora de 13º salario (ambas cuotas, FGTS por cuota)
- [x] Historial de cálculos con guardar y vista detallada
- [x] Calendario de plazos eSocial para empleadores domésticos
- [x] Generación de contracheque (recibo de pago) PDF
- [x] Sistema de notificaciones email para plazos eSocial
- [x] Calculadora de vacaciones (férias)
- [x] Calculadora de rescisión (rescisão)

### Sprint 3 - Landing y Onboarding
- [x] Landing page v1 (hero, problema, features, pricing)
- [x] Landing page v2 (pricing tiers, background check, eSocial, social proof)
- [x] Onboarding wizard + Vercel analytics + Sentry
- [x] Blog con 5+ posts SEO
- [x] FAQ completa sobre eSocial empleador doméstico
- [x] Stripe subscription integration

### Sprint 4 - eSocial y Integraciones
- [x] WhatsApp reminder integration para plazos DAE
- [x] Background check MVP (Phase 2)
- [x] Infraestructura eSocial (Phase 3 Part 1) - API client, cert manager, RPA
- [x] Info legal COCORA CONSULTORIA en terms/privacy/eSocial
- [x] Contrato de trabajo PDF generator
- [x] Programa de referidos (indicar amigos)
- [x] eSocial automation completa (Phase 4) - proxy, procesador mensual, DAE, dashboard

### Batch B - Calidad
- [x] Newsletter subscription
- [x] Rate limiting en API routes
- [x] Audit logs
- [x] 34 E2E tests (Playwright) - landing, auth, calculator, simulator, blog, FAQ
- [x] Vacation receipt, TRCT, prior notice PDF generators

### Branding
- [x] Logo SVG (chevron simple + 3 rayos de sol + texto LarDia)
- [x] Favicon: chevron + rayos en emerald-500 sobre fondo blanco
- [x] Color principal: emerald-500 (#10B981)
- [x] Correcciones de acentos portugueses (~57 archivos)
- [x] Mobile nav hamburger menu
- [x] SharedPublicNav component

### Auth
- [x] Magic link como método primario
- [x] Password como fallback
- [x] Resend email integration (welcome, DAE reminder, payroll processed)

### Refactor 2026-02-16
- [x] Employee form: 564 → 161 líneas, 25 useStates → react-hook-form, 4 step components
- [x] Shared hooks: use-api.ts, use-cep-lookup.ts, info-tip.tsx extraídos
- [x] Landing page: 569 → 33 líneas, 12 section components
- [x] Resend setup guide + 3 email templates HTML con branding LarDia
- [x] 69 tests passing, TypeScript limpio

---

## Configuración

### Variables de Entorno (Vercel)
- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] STRIPE_SECRET_KEY (live)
- [x] STRIPE_WEBHOOK_SECRET
- [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live)
- [x] RESEND_API_KEY
- [x] ESOCIAL_PROXY_URL → https://api.lardia.com.br (actualizado por Paula, 2026-02-16)
- [x] ESOCIAL_API_KEY

### Variables de Entorno (.env.local)
- [x] ESOCIAL_PROXY_URL ya usa https (confirmado 2026-02-16)

### EC2
- [x] eSocial proxy running (systemd)
- [x] Nginx con SSL (Let's Encrypt)
- [x] API key configurada

### Email
- [x] ImprovMX: forwarding *@lardia.com.br → paumejiagiraldo@gmail.com (2026-02-16)
- [x] Resend: DKIM verificado (2026-02-16)
- [x] Email templates creados en docs/email-templates/ (confirmation, magic-link, password-reset)
- [x] Guía de setup: docs/RESEND-SETUP.md
- [x] Resend: SPF verificado (sa-east-1 era correcto) (2026-02-17)
- [x] Supabase Auth SMTP: configurado con Resend (2026-02-17)

---

## Pendiente

### Paula
- [ ] Crear cuenta Bright Data (VPN residencial para eSocial RPA)
- [ ] Grabar video tutorial de procuração eCAC (2-3 min screen recording)
- [ ] Crear cuenta Twilio + configurar credenciales WhatsApp
- [ ] Revisar/aprobar email templates de docs/email-templates/

### Cocora
- [ ] Configurar Bright Data proxy en EC2 (cuando Paula pase credenciales)
- [ ] Test login eSocial con VPN residencial
- [ ] Capturar selectores reales del eSocial y actualizar RPA scripts
- [ ] Refactor pendiente: background check page (493 líneas)
- [ ] Actualizar onboarding page con nuevos shared hooks (use-api, use-cep-lookup)

### Futuro
- [ ] BigDataCorp API (background check real) - esperando respuesta
- [ ] Monitoreo/alertas para el proxy eSocial en EC2
- [ ] CI/CD pipeline (tests automáticos en PR)
- [ ] Backup strategy para Supabase
- [ ] Legal review (ToS/privacy/LGPD)

---

## Bloqueado

- **eSocial RPA login** — gov.br SSO bloquea IPs de datacenter (403). Necesitamos VPN residencial (Bright Data). Paula creando cuenta.
- **WhatsApp real (Twilio)** — Paula necesita crear cuenta Twilio y obtener credenciales.

---

*Empresa: COCORA CONSULTORIA E SERVIÇOS ADMINISTRATIVOS LTDA — CNPJ: 46.728.966/0001-40*
