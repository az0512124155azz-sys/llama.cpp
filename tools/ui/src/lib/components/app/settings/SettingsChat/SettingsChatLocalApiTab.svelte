<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';

	const STORAGE = 'llama-ui-local-api-v1';

	type LocalApiPrefs = {
		modelPath: string;
		modelsDir: string;
		host: string;
		port: string;
		lanIp: string;
		alias: string;
	};

	const defaults: LocalApiPrefs = {
		modelPath: '',
		modelsDir: '',
		host: '0.0.0.0',
		port: '8080',
		lanIp: '',
		alias: 'local-model'
	};

	let prefs = $state<LocalApiPrefs>({ ...defaults });
	let status = $state<'unknown' | 'up' | 'down'>('unknown');
	let statusDetail = $state('');
	let modelsJson = $state('');
	let copied = $state('');
	let pageOrigin = $state('');

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE);
			if (raw) prefs = { ...defaults, ...JSON.parse(raw) };
		} catch {
			/* ignore */
		}
	}

	function save() {
		localStorage.setItem(STORAGE, JSON.stringify(prefs));
	}

	function persist() {
		save();
	}

	const apiBase = $derived(
		prefs.lanIp.trim()
			? `http://${prefs.lanIp.trim()}:${prefs.port.trim() || '8080'}`
			: pageOrigin || `http://127.0.0.1:${prefs.port.trim() || '8080'}`
	);

	const openAiBase = $derived(`${apiBase.replace(/\/$/, '')}/v1`);

	const startCommand = $derived.by(() => {
		const port = prefs.port.trim() || '8080';
		const host = prefs.host.trim() || '0.0.0.0';
		const alias = prefs.alias.trim();
		const parts = ['llama-server', `--host ${host}`, `--port ${port}`];
		if (alias) parts.push(`--alias ${alias}`);
		if (prefs.modelPath.trim()) {
			parts.push(`-m "${prefs.modelPath.trim()}"`);
		} else if (prefs.modelsDir.trim()) {
			parts.push(`--models-dir "${prefs.modelsDir.trim()}"`);
		} else {
			parts.push('-m "PATH\\TO\\model.gguf"');
		}
		return parts.join(' ');
	});

	const curlExample = $derived(
		`curl ${openAiBase}/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d "{\"model\":\"${prefs.alias || 'local-model'}\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}"`
	);

	const pythonExample = $derived(
		`from openai import OpenAI\n\nclient = OpenAI(base_url="${openAiBase}", api_key="local")\nr = client.chat.completions.create(\n    model="${prefs.alias || 'local-model'}",\n    messages=[{"role": "user", "content": "Hello"}]\n)\nprint(r.choices[0].message.content)`
	);

	const qrUrl = $derived(
		`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(openAiBase)}`
	);

	async function copyText(label: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = label;
			setTimeout(() => {
				if (copied === label) copied = '';
			}, 1500);
		} catch {
			copied = 'failed';
		}
	}

	async function checkStatus() {
		status = 'unknown';
		statusDetail = 'Checking…';
		modelsJson = '';
		const base = pageOrigin || `http://127.0.0.1:${prefs.port.trim() || '8080'}`;
		try {
			const h = await fetch(`${base}/health`, { cache: 'no-store' });
			if (!h.ok && h.status !== 503) throw new Error(`HTTP ${h.status}`);
			status = h.status === 503 ? 'down' : 'up';
			statusDetail = h.status === 503 ? 'Server loading model (503)' : 'Server reachable';
			try {
				const m = await fetch(`${base}/v1/models`, { cache: 'no-store' });
				if (m.ok) {
					const data = await m.json();
					modelsJson = JSON.stringify(data, null, 2);
					statusDetail += ` · ${(data.data || []).length || 0} model(s) in /v1/models`;
				}
			} catch {
				/* optional */
			}
		} catch (e) {
			status = 'down';
			statusDetail = e instanceof Error ? e.message : String(e);
		}
	}

	async function detectLanIp() {
		try {
			const pc = new RTCPeerConnection({ iceServers: [] });
			pc.createDataChannel('');
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			await new Promise((r) => setTimeout(r, 400));
			const sdp = pc.localDescription?.sdp || '';
			pc.close();
			const match = sdp.match(/(\d{1,3}(?:\.\d{1,3}){3})/g);
			const ip = (match || []).find(
				(x) =>
					x.startsWith('192.168.') ||
					x.startsWith('10.') ||
					/^172\.(1[6-9]|2\d|3[0-1])\./.test(x)
			);
			if (ip) {
				prefs.lanIp = ip;
				save();
			}
		} catch {
			/* user can type IP */
		}
	}

	function downloadStartBat() {
		const body = `@echo off\nchcp 65001 >nul\ntitle llama-server Local API\necho Starting: ${startCommand}\necho.\n${startCommand}\npause\n`;
		const blob = new Blob([body], { type: 'application/x-bat' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'START-llama-server-local-api.bat';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	onMount(() => {
		load();
		pageOrigin = typeof window !== 'undefined' ? window.location.origin : '';
		void checkStatus();
		void detectLanIp();
	});
</script>

<div class="space-y-6">
	<p class="text-sm text-muted-foreground">
		Expose local GGUF models as an OpenAI-compatible API. The browser cannot start
		<code class="text-xs">llama-server</code> itself — use the command or .bat below. USB paths work
		(e.g. <code class="text-xs">E:\\GGUF\\model.gguf</code>).
	</p>

	<div class="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3">
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-sm font-medium">Server status</span>
			<span
				class="rounded-full px-2 py-0.5 text-xs {status === 'up'
					? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
					: status === 'down'
						? 'bg-red-500/15 text-red-600 dark:text-red-400'
						: 'bg-muted text-muted-foreground'}"
			>
				{status === 'up' ? 'Up' : status === 'down' ? 'Down' : '…'}
			</span>
			<Button size="sm" variant="outline" onclick={() => checkStatus()}>Refresh</Button>
		</div>
		<p class="text-xs text-muted-foreground">{statusDetail}</p>
		{#if modelsJson}
			<pre class="max-h-32 overflow-auto rounded-md bg-background/80 p-2 text-xs">{modelsJson}</pre>
		{/if}
	</div>

	<div class="space-y-2">
		<Label>OpenAI Base URL</Label>
		<div class="flex gap-2">
			<Input readonly value={openAiBase} class="font-mono text-sm" />
			<Button variant="outline" size="sm" onclick={() => copyText('url', openAiBase)}>
				{copied === 'url' ? 'Copied' : 'Copy'}
			</Button>
		</div>
	</div>

	<div class="space-y-3">
		<div class="space-y-1.5">
			<Label for="model-path">Model file (GGUF) — disk or USB</Label>
			<Input
				id="model-path"
				placeholder="E:\\GGUF\\my-model-Q4_K_M.gguf"
				bind:value={prefs.modelPath}
				oninput={persist}
				class="font-mono text-sm"
			/>
		</div>
		<div class="space-y-1.5">
			<Label for="models-dir">Or models directory</Label>
			<Input
				id="models-dir"
				placeholder="E:\\GGUF"
				bind:value={prefs.modelsDir}
				oninput={persist}
				class="font-mono text-sm"
			/>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
			<div class="space-y-1.5">
				<Label for="host">--host</Label>
				<Input id="host" bind:value={prefs.host} oninput={persist} class="font-mono text-sm" />
			</div>
			<div class="space-y-1.5">
				<Label for="port">--port</Label>
				<Input id="port" bind:value={prefs.port} oninput={persist} class="font-mono text-sm" />
			</div>
			<div class="space-y-1.5">
				<Label for="alias">--alias</Label>
				<Input id="alias" bind:value={prefs.alias} oninput={persist} class="font-mono text-sm" />
			</div>
			<div class="space-y-1.5">
				<Label for="lan">LAN IP</Label>
				<Input
					id="lan"
					placeholder="192.168.1.10"
					bind:value={prefs.lanIp}
					oninput={persist}
					class="font-mono text-sm"
				/>
			</div>
		</div>
		<Button size="sm" variant="outline" onclick={() => detectLanIp()}>Detect LAN IP</Button>
	</div>

	<div class="space-y-2">
		<Label>Start / Stop</Label>
		<p class="text-xs text-muted-foreground">
			Start: run command or .bat. Stop: Ctrl+C in that terminal.
		</p>
		<pre class="overflow-x-auto rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">{startCommand}</pre>
		<div class="flex flex-wrap gap-2">
			<Button size="sm" onclick={() => copyText('cmd', startCommand)}>
				{copied === 'cmd' ? 'Copied' : 'Copy command'}
			</Button>
			<Button size="sm" variant="outline" onclick={downloadStartBat}>Download .bat</Button>
		</div>
	</div>

	<div class="space-y-2">
		<Label>curl</Label>
		<pre class="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">{curlExample}</pre>
		<Button size="sm" variant="outline" onclick={() => copyText('curl', curlExample)}>
			{copied === 'curl' ? 'Copied' : 'Copy curl'}
		</Button>
	</div>

	<div class="space-y-2">
		<Label>Python</Label>
		<pre class="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">{pythonExample}</pre>
		<Button size="sm" variant="outline" onclick={() => copyText('py', pythonExample)}>
			{copied === 'py' ? 'Copied' : 'Copy Python'}
		</Button>
	</div>

	<div class="space-y-2">
		<Label>QR (phone on same Wi‑Fi)</Label>
		<div class="flex flex-wrap items-start gap-4">
			<img
				src={qrUrl}
				alt="QR for API base URL"
				width="160"
				height="160"
				class="rounded-lg border border-border/40 bg-white p-1"
			/>
			<p class="max-w-xs text-xs text-muted-foreground">
				<code class="break-all">{openAiBase}</code><br />
				Allow port {prefs.port || '8080'} in firewall.
			</p>
		</div>
	</div>
</div>
