<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { skillsStore } from '$lib/stores/skills/index.svelte';
</script>

<div class="space-y-4">
	<p class="text-sm text-muted-foreground">
		Skills inject full instructions into the system message. They do not change the theme or layout.
	</p>

	{#each skillsStore.skills as skill (skill.id)}
		<label
			class="flex cursor-pointer items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-3"
		>
			<Checkbox
				checked={skill.enabled}
				onCheckedChange={() => skillsStore.toggle(skill.id)}
				class="mt-0.5"
			/>
			<span class="flex min-w-0 flex-col gap-0.5">
				<span class="text-sm font-medium">{skill.name}</span>
				<span class="text-xs text-muted-foreground">{skill.description}</span>
			</span>
		</label>
	{/each}

	<Button variant="outline" size="sm" onclick={() => skillsStore.reset()}>
		Reset skills to defaults
	</Button>
</div>
