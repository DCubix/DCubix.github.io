<script lang="ts">
  import ProfilePicture from "./lib/components/ProfilePicture.svelte";
  import { Github, Linkedin, Mail } from 'lucide-svelte';
  import data from '../public/data.json';
</script>

<main class="w-full mx-8 md:w-2/5 md:m-auto p-12">
  <div class="flex">
    <ProfilePicture/>
    <div class="flex flex-col justify-center items-center md:ml-6 md:items-start">
        <span class="m-0 mb-2 font-mono font-semibold text-5xl md:text-7xl">Diego Lopes</span>
        <span class="m-0 mb-3 font-normal text-2xl md:text-2xl text-white text-opacity-50">Software Developer</span>
        
        <ul class="flex gap-3">
            <li>
              <a href="https://github.com/DCubix" title="GitHub" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Github size={32} />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/diego-lopes-a47056177/" title="LinkedIn" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Linkedin size={32} />
              </a>
            </li>
            <li>
              <a href="mailto:diego95lopes@gmail.com" title="E-mail" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Mail size={32} />
              </a>
            </li>
        </ul>
    </div>
  </div>

  <h1 class="text-2xl font-semibold my-5">My Gallery</h1>
  <div class="w-full overflow-x-auto flex">
    {#each data as item}
      <div class="flex flex-col mr-6 bg-black bg-opacity-30 p-5 rounded-3xl my-2">
        <div class="grid-tiles">
          {#each item.images as image}
            <a
              href={image}
              rel="noreferrer"
              target="_blank"
              class="grid-tile bg-center bg-cover shadow-2xl"
              style={"background-image: url('" + image + "')"}>
            </a>
          {/each}
        </div>
        <span class="font-semibold text-xl mt-2">{item.name}</span>
        <span class="text-white text-opacity-70">{item.description}</span>
      </div>
    {/each}
  </div>
</main>
