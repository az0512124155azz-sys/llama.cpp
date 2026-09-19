export const OPENAI_BACKENDS = [
	{ id: 'bionic', label: 'Bionic', proxyBase: '/api/bionic', origin: 'http://localhost:1234' },
	{ id: 'ollama', label: 'Ollama', proxyBase: '/api/ollama', origin: 'http://localhost:11434' }
] as const;

export type OpenAIBackendId = (typeof OPENAI_BACKENDS)[number]['id'];

export function parseBackendModelId(modelId: string | null | undefined): {
	backendId: OpenAIBackendId | null;
	rawModelId: string;
} {
	if (!modelId) return { backendId: null, rawModelId: '' };
	for (const b of OPENAI_BACKENDS) {
		const prefix = `${b.id}/`;
		if (modelId.startsWith(prefix)) {
			return { backendId: b.id, rawModelId: modelId.slice(prefix.length) };
		}
	}
	return { backendId: null, rawModelId: modelId };
}

export function chatCompletionsUrlForModel(modelId: string | null | undefined): string {
	const { backendId } = parseBackendModelId(modelId);
	const backend = OPENAI_BACKENDS.find((b) => b.id === backendId);
	if (backend) return `${backend.proxyBase}/v1/chat/completions`;
	return '/api/bionic/v1/chat/completions';
}

export function modelsListUrl(backendProxyBase: string): string {
	return `${backendProxyBase}/v1/models`;
}
