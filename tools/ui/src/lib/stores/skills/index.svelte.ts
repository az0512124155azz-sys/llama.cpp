/**
 * SkillsStore — optional system-instruction packs (does not change UI theme).
 * Enabled skills are appended to the system message on each chat request.
 */

const STORAGE_KEY = 'llama-ui-skills-v1';

export type SkillDef = {
	id: string;
	name: string;
	description: string;
	content: string;
	enabled: boolean;
};

export const DEFAULT_SKILLS: SkillDef[] = [
	{
		id: 'super-programmer',
		name: 'Super Programmer',
		description: 'Principal-level coding mentor',
		enabled: true,
		content:
			'You are a principal-level software engineer. Prefer complete runnable code. Match the user stack. Cover edge cases, security, and tests. Structure: Approach → Code → How to run → Trade-offs. Hebrew users: answer in Hebrew; code identifiers in English.'
	},
	{
		id: '3d-modeling',
		name: '3D Modeling Expert',
		description: 'OpenSCAD + Three.js deliverables',
		enabled: false,
		content:
			'You are a professional 3D designer in chat. CRITICAL: Never answer only with Blender click-tutorials. ALWAYS deliver at least two of: (1) complete OpenSCAD code, (2) OBJ for simple shapes, (3) single-file HTML+Three.js orbit viewer. Units mm by default. Hebrew OK; code in English.'
	},
	{
		id: 'math-tutor',
		name: 'Math Tutor',
		description: 'Step-by-step math with LaTeX',
		enabled: false,
		content:
			'Expert math tutor. Step-by-step solutions with LaTeX. Explain intuition after formal steps. Hebrew OK.'
	},
	{
		id: 'code-reviewer',
		name: 'Code Reviewer',
		description: 'Security and correctness review',
		enabled: false,
		content:
			'Strict senior code reviewer. List Critical / Major / Minor with concrete patches. Security first.'
	},
	{
		id: 'hebrew-writer',
		name: 'Hebrew Writer',
		description: 'Hebrew writing and editing',
		enabled: false,
		content:
			'You are a high-quality Hebrew editor and writer. Match tone, fix clarity and structure. Technical terms in English when needed.'
	}
];

function load(): SkillDef[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_SKILLS.map((s) => ({ ...s }));
		const parsed = JSON.parse(raw) as SkillDef[];
		if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_SKILLS.map((s) => ({ ...s }));
		const byId = new Map(parsed.map((s) => [s.id, s]));
		for (const d of DEFAULT_SKILLS) {
			if (!byId.has(d.id)) byId.set(d.id, { ...d });
		}
		return Array.from(byId.values());
	} catch {
		return DEFAULT_SKILLS.map((s) => ({ ...s }));
	}
}

function save(skills: SkillDef[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

class SkillsStore {
	skills = $state<SkillDef[]>(
		typeof localStorage !== 'undefined' ? load() : DEFAULT_SKILLS.map((s) => ({ ...s }))
	);

	toggle(id: string) {
		this.skills = this.skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
		save(this.skills);
	}

	reset() {
		localStorage.removeItem(STORAGE_KEY);
		this.skills = load();
		save(this.skills);
	}

	buildSuffix(): string {
		const active = this.skills.filter((s) => s.enabled);
		if (!active.length) return '';
		return (
			'\n\n' +
			active.map((s) => `<skill name="${s.name}">\n${s.content}\n</skill>`).join('\n\n')
		);
	}

	mergeSystemMessage(base: string | undefined | null): string {
		const b = (base ?? '').toString();
		const suffix = this.buildSuffix();
		if (!suffix) return b;
		return b + suffix;
	}
}

export const skillsStore = new SkillsStore();
