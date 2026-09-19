import { ServerRole } from '$lib/enums';
import { OPENAI_BACKENDS, modelsListUrl } from '$lib/constants/openai-backends';
import { apiFetch, apiFetchWithParams } from '$lib/utils';

function synthesize(modelId: string): ApiLlamaCppServerProps {
	return {
		default_generation_settings: {
			id: 0, id_task: 0, n_ctx: 8192, speculative: false, is_processing: false,
			params: {
				n_predict: -1, seed: -1, temperature: 0.8, dynatemp_range: 0, dynatemp_exponent: 1,
				top_k: 40, top_p: 0.95, min_p: 0.05, top_n_sigma: 1, xtc_probability: 0, xtc_threshold: 0.1,
				typ_p: 1, repeat_last_n: 64, repeat_penalty: 1, presence_penalty: 0, frequency_penalty: 0,
				dry_multiplier: 0, dry_base: 1.75, dry_allowed_length: 2, dry_penalty_last_n: -1,
				dry_sequence_breakers: [], mirostat: 0, mirostat_tau: 5, mirostat_eta: 0.1, stop: [],
				max_tokens: -1, n_keep: 0, n_discard: 0, ignore_eos: false, stream: true, logit_bias: [],
				n_probs: 0, min_keep: 0, grammar: '', grammar_lazy: false, grammar_triggers: [],
				preserved_tokens: [], chat_format: '', reasoning_format: '', reasoning_in_content: false,
				generation_prompt: '', samplers: [], backend_sampling: false,
				'speculative.n_max': 0, 'speculative.n_min': 0, 'speculative.p_min': 0,
				timings_per_token: false, post_sampling_probs: false, lora: []
			},
			prompt: '',
			next_token: { has_next_token: false, has_new_line: false, n_remain: -1, n_decoded: 0, stopping_word: '' }
		},
		total_slots: 1, model_path: modelId, role: ServerRole.MODEL,
		modalities: { vision: false, audio: false, video: false },
		chat_template: '', bos_token: '', eos_token: '',
		build_info: 'openai-compatible (Bionic + Ollama)'
	};
}

async function fetchFromOpenAIBackends(preferred?: string): Promise<ApiLlamaCppServerProps> {
	for (const backend of OPENAI_BACKENDS) {
		try {
			const list = await apiFetch<{ data?: Array<{ id?: string }> }>(modelsListUrl(backend.proxyBase), { authOnly: true });
			if (list?.data?.length) {
				return synthesize(preferred || `${backend.id}/${list.data[0].id}`);
			}
		} catch { /* next */ }
	}
	throw new Error('No backend (Bionic :1234 / Ollama :11434)');
}

export class PropsService {
	static async fetch(autoload = false): Promise<ApiLlamaCppServerProps> {
		const params: Record<string, string> = {};
		if (!autoload) params.autoload = 'false';
		try {
			return await apiFetchWithParams<ApiLlamaCppServerProps>('./props', params, { authOnly: true });
		} catch {
			return fetchFromOpenAIBackends();
		}
	}
	static async fetchForModel(modelId: string, autoload = false): Promise<ApiLlamaCppServerProps> {
		const params: Record<string, string> = { model: modelId };
		if (!autoload) params.autoload = 'false';
		try {
			return await apiFetchWithParams<ApiLlamaCppServerProps>('./props', params, { authOnly: true });
		} catch {
			return fetchFromOpenAIBackends(modelId);
		}
	}
}
