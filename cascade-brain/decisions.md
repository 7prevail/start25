# Technical Decisions Log

*Why certain choices were made*

---

## 2026-05-01 - start25 Git Structure

**Decision:** Keep files inside `start25 project/` folder on GitHub, not at root

**Why:**
- User has multiple projects locally
- Only want `start25 project` on GitHub
- Vercel can be configured to deploy from subfolder
- Keeps repo clean and focused

**Alternative rejected:** Files at root - would mix with other local folders

---

## 2026-05-01 - Security Policy Location

**Decision:** `SECURITY.md` inside `start25 project/`

**Why:**
- GitHub recognizes it for security tab
- Specific to start25 project
- Contact info: as1730 / 7prevail

---

## 2026-05-01 - Profile Display Format

**Decision:** `DisplayName` on top, `@username Level X` below

**Why:**
- User specifically requested this format
- Username sanitized (no spaces, lowercase)
- Level shows progress

**History:**
- First: tried `@ Level X`
- Then: tried `@username Level`
- Final: `DisplayName` / `@username Level X`

---
