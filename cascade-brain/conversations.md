# Conversation Memories

*Date format: YYYY-MM-DD*

---

## 2026-05-01 - Git Repository Chaos

**What happened:**
- User had nested git repos causing submodule issues
- `start25 project/` folder was showing as arrow (submodule) on GitHub
- Root files were duplicated
- Other folders (clearsite, dead projects, etc.) were getting pushed to wrong repo

**Resolution:**
- Removed .git folder from `start25 project/`
- Cleaned repo to only contain `start25 project/` folder
- Other folders stay local-only
- User wants files inside folder on GitHub, not at root

**Lesson:** User values clean git history and gets frustrated by clutter.

---

## 2026-05-01 - User Communication Style

**Observed:**
- Extremely terse messages ("k", "nvm", "alrigh")
- Gets angry when I don't understand immediately
- Expects me to act, not ask questions
- Rapid context switching
- Dislikes verbose explanations

**Response pattern:**
- Keep answers short
- Act first, confirm later only if critical
- Don't over-explain
- Handle git workflow automatically

---

## 2026-05-01 - Project Structure Clarified

**Final structure agreed:**
- Local: `/Users/san0031/Desktop/home/start25 project/` (folder with files)
- GitHub: `as1730/start25.git` contains `start25 project/` folder
- GitHub: `as1730/start25landing.git` for landing page (separate repo)
- Other projects stay local in `dead projects/`, `projects/`, etc.

**Push workflow:**
- User says "push to github" → I commit and push immediately
- User makes edits → I should offer to push

---

## 2026-05-01 - Bug Testing Session

**What happened:**
- User and friend bug tested start25
- Issues found and fixed:

**Bugs Fixed:**
1. **Missing null checks on getElementById** - Added null checks before accessing .value, .textContent, .style properties
2. **Unsafe JSON.parse on localStorage** - Created safeParse() helper with try-catch to handle corrupted data
3. **API response validation** - Added null checks for data.choices[0].message before accessing content
4. **JSON.parse on AI responses** - Added try-catch around parsing questions, tasks, flashcards from AI
5. **renderQuestions not defined** - Changed to use existing renderAIStudyQuestion function
6. **API request failed** - Added Groq as fallback in gemini.js when all Gemini models fail
7. **AI not working** - Added Groq model routing in gemini.js (detects Groq model names and routes directly)
8. **Profile pill unreadable in dark mode** - Added dark mode specific styles for profile-pill
9. **Profile not working** - Fixed streakCalendar ID mismatch (was 'streakCalendar', should be 'profileStreakCalendar')
10. **Category mandatory** - Already enforced in saveSubjectFromModal
11. **Long subject names** - Added text-overflow ellipsis with max-width on subject cards
12. **Cancel button black text in dark mode** - Added color: var(--text) to modal buttons + dark override
13. **Profile pill double-click to settings** - Changed profile page pill from settings to profile
14. **Side nav low contrast** - Added dark mode nav-item color overrides (#999)
15. **Dark mode no fade** - Added CSS transition on bg/color/border for theme change
16. **Refresh emoji to symbol** - Changed 🔄 to ↻
17. **Rename AI to Iroh** - Updated UI labels (Iroh Chat, Iroh Podcast, Iroh Study, Iroh Study Quiz)
18. **Exam answer checker** - Added getIrohFeedback() function with AI-powered personalized quiz feedback
19. **Settings dilemma** - Added back button to settings page
20. **Subjects core** - Added field migration in initializeSubjectLevels (tags, materials, weakAreas, emoji defaults)

**Files modified:**
- start25 project/index.html
- start25 project/api/gemini.js

---
