# Custom Skills (no theme changes)

Added to `tools/ui`:

- **Settings → Skills**: Super Programmer, 3D Modeling, Math Tutor, Code Reviewer, Hebrew Writer
- Enabled skills append to the system message on every chat
- Design / CSS is untouched

Already built into this UI (use as-is):

- Token / generation stats (Display settings)
- Agentic mode + Tools
- MCP servers including recommended **GitHub**
- System Message field (General)

## Apply remaining wiring

If `git pull` does not include chat injection yet, extract `llama-cpp-ui-skills.zip` over the repo, then:

```bash
cd tools/ui
npm install
npm run dev
```
