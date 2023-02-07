<script lang="ts">
  import { Github, Play, PlayCircle } from "lucide-svelte";
  import type PostData from "../../PostData";

  export let item: PostData;
</script>

<div class="bg-black bg-opacity-30 p-5 rounded-3xl my-2">
  <div class="flex flex-col">
    <div class="flex justify-end">
      <span class="font-semibold text-xl">{item.name}</span>
      <div class="flex-auto"></div>
      
      {#if item.github}
        <a class="flatbutton" href={item.github}>
          <Github size={16} />&nbsp;GitHub
        </a>
      {/if}

      {#if item.demo}
        <a class="flatbutton" href={item.demo}>
          <Play size={16} />&nbsp;Demo
        </a>
      {/if}
    </div>
    {#if item.tech}
      <div>
        {#each item.tech as tech}
          <span class="tech">{tech}</span>
        {/each}
      </div>
    {/if}
    <span class="text-white text-opacity-70 mb-3 text-justify">{item.description}</span>
  </div>
  <div class="grid-tiles">
    {#each item.images as image}
      {#if ['mp4','flv','ogg','avi'].includes(image.substring(image.lastIndexOf('.')+1))}
        <!-- video -->
        <!-- svelte-ignore a11y-media-has-caption -->
        <a
          href={image}
          rel="noreferrer"
          target="_blank"
          class="grid-tile bg-center bg-cover shadow-2xl overflow-hidden relative">
          <video preload="metadata" muted class="w-full h-full object-cover z-0">
            <source src={image + '#t=15'} type={"video/" + image.substring(image.lastIndexOf('.')+1)}>
          </video>
          <PlayCircle size={60} class="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </a>
      {:else}
        <!-- image -->
        <a
          href={image}
          rel="noreferrer"
          target="_blank"
          class="grid-tile bg-center bg-cover shadow-2xl"
          style={"background-image: url('" + image + "')"}>
        </a>
      {/if}
    {/each}
  </div>
</div>